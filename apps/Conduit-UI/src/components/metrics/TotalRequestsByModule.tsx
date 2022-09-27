import moment, { Moment } from 'moment';
import React, { FC, useEffect, useState } from 'react';
import { ModulesTypes } from '../../models/logs/LogsModels';
import { asyncGetMetricsQuery } from '../../redux/slices/metricsSlice';
import { useAppDispatch, useAppSelector } from '../../redux/store';
import AreaChart from '../charts/AreaChart';
import MetricOptions from './MetricOptions';

interface Props {
  module: ModulesTypes;
}

const steps = ['1s', '10s', '1m', '10m', '1h', '12h', '1w', '2w'];

const TotalRequestsByModule: FC<Props> = ({ module }) => {
  const dispatch = useAppDispatch();

  const [startDateValue, setStartDateValue] = useState<Moment | null>(null);
  const [endDateValue, setEndDateValue] = useState<Moment | null>(null);
  const [selectedStep, setSelectedStep] = useState<string>('10m');

  const data = useAppSelector((state) => state?.metricsSlice?.data?.moduleTotalRequests?.[module]);

  const loading = useAppSelector(
    (state) => state?.metricsSlice?.meta?.moduleTotalRequestsLoading?.[module]
  );

  useEffect(() => {
    dispatch(
      asyncGetMetricsQuery({
        module,
        startDate: startDateValue
          ? startDateValue.valueOf() / 1000
          : moment().subtract(1, 'hours').unix(),
        endDate: endDateValue ? endDateValue.valueOf() / 1000 : moment().unix(),
        step: selectedStep,
      })
    );
  }, [dispatch, module, startDateValue, endDateValue, selectedStep]);

  return (
    <>
      <MetricOptions
        startDateValue={startDateValue}
        setStartDateValue={setStartDateValue}
        endDateValue={endDateValue}
        setEndDateValue={setEndDateValue}
        selectedStep={selectedStep}
        setSelectedStep={setSelectedStep}
        steps={steps}
      />
      <AreaChart
        label={'total requests'}
        timestamps={data?.timestamps}
        counters={data?.counters}
        graphTitle={'Total module requests'}
        loading={loading}
      />
    </>
  );
};

export default TotalRequestsByModule;
