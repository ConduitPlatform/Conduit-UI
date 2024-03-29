import React, { FC, useEffect, useState } from 'react';
import moment, { Moment } from 'moment';
import { useAppDispatch, useAppSelector } from '../../redux/store';
import AreaChart from '../charts/AreaChart';
import { asyncGetGenericMetricQueryRange } from '../../redux/slices/metricsSlice';
import MetricWidgetOptions from './MetricWidgetOptions';
import { GraphContainer } from '@conduitplatform/ui-components';
import { completeExpression } from '../../utils/injectMetricsLabels';

interface Props {
  expression: string;
  graphTitle?: string;
  labels?: { [key: string]: string | number | boolean };
  hasControls?: boolean;
  label?: string;
  canZoom?: boolean;
}

const steps = ['1s', '10s', '1m', '10m', '1h', '12h', '1w', '2w'];

const ExtractQueryRangeGraph: FC<Props> = ({
  expression,
  graphTitle,
  hasControls = true,
  label = 'value',
  canZoom = true,
  labels,
}) => {
  const dispatch = useAppDispatch();

  const [startDateValue, setStartDateValue] = useState<Moment | null>(null);
  const [endDateValue, setEndDateValue] = useState<Moment | null>(null);
  const [selectedStep, setSelectedStep] = useState<string>('10m');
  const [detailedView, setDetailedView] = useState<boolean>(false);

  const data = useAppSelector(
    (state) => state?.metricsSlice?.data?.genericMetric?.[completeExpression(expression, labels)]
  );

  const loading = useAppSelector(
    (state) =>
      state?.metricsSlice?.meta.genericMetricLoading?.[completeExpression(expression, labels)]
  );

  useEffect(() => {
    dispatch(
      asyncGetGenericMetricQueryRange({
        expression: completeExpression(expression, labels),
        startDate: startDateValue
          ? startDateValue.valueOf() / 1000
          : moment().subtract(1, 'hours').unix(),
        endDate: endDateValue ? endDateValue.valueOf() / 1000 : moment().unix(),
        step: selectedStep,
      })
    );
  }, [dispatch, expression, startDateValue, endDateValue, selectedStep, labels]);

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
        timestamps={data?.timestamps}
        counters={data?.counters}
        graphTitle={!hasControls || detailedView ? graphTitle : undefined}
        canZoom={canZoom}
        loading={loading}
      />
    </GraphContainer>
  );
};

export default ExtractQueryRangeGraph;
