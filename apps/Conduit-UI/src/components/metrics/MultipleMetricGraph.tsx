import React, { FC, useEffect, useMemo, useState } from 'react';
import moment, { Moment } from 'moment';

import { useAppDispatch, useAppSelector } from '../../redux/store';
import AreaChart from '../charts/AreaChart';
import {
  ExpressionsRoutesArray,
  MetricsData,
  MultipleSeries,
} from '../../models/metrics/metricsModels';
import { asyncGetGenericMetricQueryRange } from '../../redux/slices/metricsSlice';
import MetricWidgetOptions from './MetricWidgetOptions';
import { GraphContainer } from '@conduitplatform/ui-components';

interface Props {
  expressionsRoutes: ExpressionsRoutesArray[];
  graphTitle?: string;
  hasControls?: boolean;
  label?: string;
  canZoom?: boolean;
}

const steps = ['1s', '10s', '1m', '10m', '1h', '12h', '1w', '2w'];

const MultipleMetricGraph: FC<Props> = ({
  expressionsRoutes,
  graphTitle,
  hasControls = true,
  label = 'value',
  canZoom = true,
}) => {
  const dispatch = useAppDispatch();

  const [startDateValue, setStartDateValue] = useState<Moment | null>(null);
  const [endDateValue, setEndDateValue] = useState<Moment | null>(null);
  const [selectedStep, setSelectedStep] = useState<string>('10m');
  const [detailedView, setDetailedView] = useState<boolean>(false);

  const totalData: Record<string, MetricsData> = useAppSelector(
    (state) => state?.metricsSlice?.data?.genericMetric
  );
  const loading: Record<string, boolean> = useAppSelector(
    (state) => state?.metricsSlice?.meta.genericMetricLoading
  );

  const prepareData = useMemo(() => {
    return Object.entries(totalData).filter(([key, item]) =>
      expressionsRoutes.some(
        (exprRoute) => key === exprRoute.expression && item?.counters?.length > 0
      )
    );
  }, [expressionsRoutes, totalData]);

  const timestamps = useMemo(() => {
    return prepareData?.find(([key, item]) => item?.timestamps?.length > 0)?.[1]?.timestamps ?? [];
  }, [prepareData]);

  useEffect(() => {
    expressionsRoutes?.map((exprRoute) => {
      dispatch(
        asyncGetGenericMetricQueryRange({
          expression: exprRoute.expression,
          startDate: startDateValue
            ? startDateValue.valueOf() / 1000
            : moment().subtract(1, 'hours').unix(),
          endDate: endDateValue ? endDateValue.valueOf() / 1000 : moment().unix(),
          step: selectedStep,
        })
      );
    });
  }, [dispatch, endDateValue, expressionsRoutes, selectedStep, startDateValue]);

  const graphLoading = useMemo(() => {
    return Object.entries(loading)
      .filter(([key, _item]) => expressionsRoutes.some((exprRoute) => key === exprRoute.expression))
      .some(([_key, item]) => item);
  }, [expressionsRoutes, loading]);

  const series = useMemo(() => {
    return prepareData.map(([key, item]) => {
      const serie: MultipleSeries = {
        name: expressionsRoutes?.find((exprRoute) => exprRoute.expression === key)?.title ?? '',
        data: item.counters,
      };
      return serie;
    });
  }, [expressionsRoutes, prepareData]);

  return (
    <GraphContainer>
      {hasControls && (
        <MetricWidgetOptions
          startDateValue={startDateValue}
          setStartDateValue={setStartDateValue}
          endDateValue={endDateValue}
          setEndDateValue={setEndDateValue}
          selectedStep={selectedStep}
          setSelectedStep={setSelectedStep}
          steps={steps}
          detailedView={detailedView}
          setDetailedView={setDetailedView}
          graphTitle={graphTitle}
        />
      )}
      <AreaChart
        label={label}
        timestamps={timestamps}
        multipleSeries={series}
        loading={graphLoading}
        graphTitle={!hasControls || detailedView ? graphTitle : undefined}
        canZoom={canZoom}
        type={'line'}
      />
    </GraphContainer>
  );
};

export default MultipleMetricGraph;
