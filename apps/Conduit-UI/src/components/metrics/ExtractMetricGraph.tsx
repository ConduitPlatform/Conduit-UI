import React, { FC, useEffect, useState } from 'react';
import moment, { Moment } from 'moment';
import { useAppDispatch, useAppSelector } from '../../redux/store';
import AreaChart from '../charts/AreaChart';
import { asyncGetGenericMetricQueryRange } from '../../redux/slices/metricsSlice';
import MetricOptions from './MetricOptions';

interface Props {
  expression: string;
  graphTitle?: string;
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
}) => {
  const dispatch = useAppDispatch();

  const [startDateValue, setStartDateValue] = useState<Moment | null>(null);
  const [endDateValue, setEndDateValue] = useState<Moment | null>(null);
  const [selectedStep, setSelectedStep] = useState<string>('10m');

  const data = useAppSelector((state) => state?.metricsSlice?.data?.genericMetric?.[expression]);

  const loading = useAppSelector(
    (state) => state?.metricsSlice?.meta.genericMetricLoading?.[expression]
  );

  useEffect(() => {
    dispatch(
      asyncGetGenericMetricQueryRange({
        expression,
        startDate: startDateValue
          ? startDateValue.valueOf() / 1000
          : moment().subtract(1, 'hours').unix(),
        endDate: endDateValue ? endDateValue.valueOf() / 1000 : moment().unix(),
        step: selectedStep,
      })
    );
  }, [dispatch, expression, startDateValue, endDateValue, selectedStep]);

  return (
    <>
      {hasControls && (
        <MetricOptions
          startDateValue={startDateValue}
          setStartDateValue={setStartDateValue}
          endDateValue={endDateValue}
          setEndDateValue={setEndDateValue}
          selectedStep={selectedStep}
          setSelectedStep={setSelectedStep}
          steps={steps}
        />
      )}
      <AreaChart
        label={label}
        timestamps={data?.timestamps}
        counters={data?.counters}
        graphTitle={graphTitle}
        canZoom={canZoom}
        loading={loading}
      />
    </>
  );
};

export default ExtractQueryRangeGraph;
