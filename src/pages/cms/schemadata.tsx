import React, { ReactElement, useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../redux/store';
import CmsLayout from '../../components/navigation/InnerLayouts/cmsLayout';
import { asyncGetCmsSchemas } from '../../redux/slices/cmsSlice';
import { Schema } from '../../models/cms/CmsModels';
import SchemaData from '../../components/cms/schema-data/SchemaData';

const SchemaDataPage = () => {
  const dispatch = useAppDispatch();
  const { schemas } = useAppSelector((state) => state.cmsSlice.data);

  const [enabledSchemas, setEnabledSchemas] = useState<Schema[]>([]);

  useEffect(() => {
    dispatch(asyncGetCmsSchemas({ skip: 0, limit: 200 }));
  }, [dispatch]);

  useEffect(() => {
    if (!schemas.schemaDocuments) return;
    const localEnabledSchemas = schemas.schemaDocuments.filter(
      (s: Schema) => s.modelOptions.conduit.cms.enabled
    );
    setEnabledSchemas(localEnabledSchemas);
  }, [schemas]);

  return <SchemaData schemas={enabledSchemas} />;
};

SchemaDataPage.getLayout = function getLayout(page: ReactElement) {
  return <CmsLayout>{page}</CmsLayout>;
};

export default SchemaDataPage;
