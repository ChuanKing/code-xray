package com.amazon.marketplacelabelaccountingmanagementservice.facade;

import static com.amazon.marketplacelabelaccountingmanagementservice.utilities.MetricsSharedAttributes.DynamoDB.CarrierMigration.CARRIER_ID;
import static com.amazon.marketplacelabelaccountingmanagementservice.utilities.MetricsSharedAttributes.DynamoDB.CarrierMigration.NEW_ACCOUNTING_MODEL_STATUS_NAME;
import static com.amazon.marketplacelabelaccountingmanagementservice.utilities.MetricsSharedAttributes.DynamoDB.CarrierMigration.OLD_ACCOUNTING_MODEL_STATUS_NAME;
import static com.amazon.marketplacelabelaccountingmanagementservice.utilities.MetricsSharedAttributes.DynamoDB.CarrierMigration.OLD_MIGRATION_STATUS_FOR_MIGRATED_CARRIER;
import static com.amazon.marketplacelabelaccountingmanagementservice.utilities.MetricsSharedAttributes.DynamoDB.CarrierMigration.SHADOWMODE_STATUS_NAME;
import static com.amazon.marketplacelabelaccountingmanagementservice.utilities.MetricsSharedAttributes.METRICS_DELIMITER;
import static com.amazon.marketplacelabelaccountingmanagementservice.utilities.Weblab.LABMAN_ACCOUNTING_MODEL_MIGRATION_CARRIER_ID_WEBLAB;

import java.util.List;

import com.google.common.collect.ImmutableList;
import com.google.inject.Inject;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import com.amazon.coral.metrics.Metrics;
import com.amazon.coral.support.metrics.CoralMetricsThreadInstance;
import com.amazon.marketplacelabelaccountingmanagementservice.accessor.GetMigrationStatusAccessor;
import com.amazon.marketplacelabelaccountingmanagementservice.domainmodel.MigrationStatusEntities;
import com.amazon.marketplacelabelaccountingmanagementservice.utilities.MetricsUtil;
import com.amazon.marketplacelabelaccountingmigrationlibrary.model.MigrationStatus;
import com.amazon.mfn.weblab.WeblabFacade;
import com.amazon.mfn.weblab.WeblabTreatment;

/**
 * Facade to retrieve the migration status for a carrier.
 */
@RequiredArgsConstructor(onConstructor = @__({
        @Inject
}))
@Slf4j
public class GetMigrationStatusFacade {

    @NonNull
    private GetMigrationStatusAccessor migrationStatusAccessor;
    @NonNull
    private WeblabFacade weblabFacade;
    private static final List<String> NEW_ACCOUNTING_MODEL_CARRIER_IDS = ImmutableList.of(
            "CHRONOPOST",
            "CHRONOPOST_FOOD",
            "DHLMX",
            "DYNAMEX",
            "ONTRAC"
    );

    /**
     * Retrieves the migration status for a carrier id and its tcda container creation date.
     * @param entities
     *          migration status entities needed to call migration library
     * @return migration status
     */
    public MigrationStatus getMigrationStatus(final MigrationStatusEntities entities) {
        Metrics metrics = CoralMetricsThreadInstance.getMetricsInstance();
        if (!entities.getTcdaContainerId().isPresent()) {
            // If execution enters this block, it means we do not have TCDAId present and this is an old purchase which should default
            // to OLD_ACCOUNTING_MODEL.
            log.info("MigrationStatusEntities[{}] does not have tcdaContainerId field. Returning OLD.", entities);
            MetricsUtil.addOneCount(metrics, OLD_ACCOUNTING_MODEL_STATUS_NAME
                    + METRICS_DELIMITER + entities.getShippingServiceId());
            MetricsUtil.addOneCount(metrics, OLD_ACCOUNTING_MODEL_STATUS_NAME
                    + METRICS_DELIMITER + CARRIER_ID + METRICS_DELIMITER + entities.getCarrierId());
            return MigrationStatus.OLD_ACCOUNTING_MODEL;
        }

        MigrationStatus migrationStatus = determineMigrationStatus(entities.getTcdaContainerId().get(),
                entities.getShippingServiceId(), entities.getCarrierId(), metrics);
        log.info("Retrieved migrationStatus [{}] for TCDAContainerId [{}]",
                migrationStatus.name(), entities.getTcdaContainerId().get());
        return migrationStatus;
    }

    private WeblabTreatment treatment;

    /**
     * Calls weblab to retrieve treatment and then uses that to return the appropriate migration status.
     *
     * If migration status from library is NEW_ACCOUNTING_MODEL, that is returned.
     * If migration status from library is OLD_ACCOUNTING_MODEL, weblab treatments are taken into account.
     * If OLD_ACCOUNTING_MODEL and C from weblabs, OLD_ACCOUNTING_MODEL is returned.
     * IF OLD_ACCOUNTING_MODEL and T1 from either weblab, SHADOWMODE is returned.
     *
     * @param tcdaContainerId
     *          tcdaContainerId
     * @param shippingServiceId
     *          the shippingServiceId
     * @param carrierId
     *          carrierId
     * @param metrics
     *          metrics
     * @return migration status
     */
    private MigrationStatus determineMigrationStatus(final String tcdaContainerId, final String shippingServiceId,
                                                     final String carrierId, final Metrics metrics) {
        MigrationStatus statusFromMigrationLibrary = migrationStatusAccessor.getMigrationStatus(tcdaContainerId);

        if (statusFromMigrationLibrary == MigrationStatus.NEW_ACCOUNTING_MODEL) {
            MetricsUtil.addOneCount(metrics, NEW_ACCOUNTING_MODEL_STATUS_NAME
                    + METRICS_DELIMITER + shippingServiceId);
            MetricsUtil.addOneCount(metrics, NEW_ACCOUNTING_MODEL_STATUS_NAME
                    + METRICS_DELIMITER + CARRIER_ID + METRICS_DELIMITER + carrierId);
            return MigrationStatus.NEW_ACCOUNTING_MODEL;
        }

        //statusFromMigrationLibrary is OLD_ACCOUNTING_MODEL at this point.
        publishMetricForNewCarriersWithOLDMigrationStatus(carrierId, tcdaContainerId, shippingServiceId, metrics);

        String carrierIdWeblab = weblabFacade.getTreatment(LABMAN_ACCOUNTING_MODEL_MIGRATION_CARRIER_ID_WEBLAB.getName(),
                carrierId, WeblabTreatment.C.getName());

        if (WeblabTreatment.T1.equalsTreatment(carrierIdWeblab)) {
            MetricsUtil.addOneCount(metrics, SHADOWMODE_STATUS_NAME
                    + METRICS_DELIMITER + shippingServiceId);
            MetricsUtil.addOneCount(metrics, SHADOWMODE_STATUS_NAME
                    + METRICS_DELIMITER + CARRIER_ID + METRICS_DELIMITER + carrierId);
            return MigrationStatus.SHADOWMODE;
        }

        MetricsUtil.addOneCount(metrics, OLD_ACCOUNTING_MODEL_STATUS_NAME
                + METRICS_DELIMITER + shippingServiceId);
        MetricsUtil.addOneCount(metrics, OLD_ACCOUNTING_MODEL_STATUS_NAME
                + METRICS_DELIMITER + CARRIER_ID + METRICS_DELIMITER + carrierId);
        return MigrationStatus.OLD_ACCOUNTING_MODEL;
    }

    /**
     * If this metric is published, this means that the carrier has not been fully configured to be migrated to NEW_ACCOUNTING_MODEL.
     * Further deep diving is needed. This metric can also be used to cut tickets to investigate as carriers are migrated onto Labman.
     *
     * @param carrierId
     *          carrier id
     * @param tcdaContainerId
     *          tcdaContainerId
     * @param shippingServiceId
     *          the shippingServiceId
     * @param metrics
     *          metrics
     */
    private void publishMetricForNewCarriersWithOLDMigrationStatus(final String carrierId, final String tcdaContainerId,
            final String shippingServiceId, final Metrics metrics) {
        if (NEW_ACCOUNTING_MODEL_CARRIER_IDS.contains(carrierId)) {
            MetricsUtil.addOneCount(metrics, OLD_MIGRATION_STATUS_FOR_MIGRATED_CARRIER
                    + METRICS_DELIMITER + CARRIER_ID + METRICS_DELIMITER + carrierId);
            log.error("Migrated carrier[{}] using shipServiceId[{}} with TCDAContainerId[{}]"
                            + " encountered non NEW_ACCOUNTING_MODEL migration status.",
                    carrierId, shippingServiceId, tcdaContainerId);
        }
    }
}
