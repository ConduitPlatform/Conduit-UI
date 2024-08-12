'use client';

import { ConduitFile } from '@/lib/models/storage';
import { useEffect, useState } from 'react';
import { getFileUrl } from '@/lib/api/storage';
import moment from 'moment';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { isEmpty } from 'lodash';
import Decimal from 'decimal.js';

export const FileDetails = ({ file }: { file: ConduitFile }) => {
  const [url, setUrl] = useState<string | undefined>(undefined);
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(undefined);

  useEffect(() => {
    getFileUrl(file._id).then(res => {
      setUrl(res.result);
      if (file.mimeType.startsWith('image')) setPreviewUrl(res.result);
    });
  }, []);

  return (
    <div className="mt-4 space-y-10">
      {previewUrl && (
        <img
          src={previewUrl}
          className="object-cover w-full h-[250px]"
          alt=""
        />
      )}
      <div className="grid gap-7">
        <div className="flex flex-col">
          <span className="font-medium text-xl">{file.alias}</span>
          <span className="font-light text-sm opacity-80">{file.name}</span>
        </div>
        {url && (
          <div className="flex flex-col w-fit space-y-2">
            <span className="font-medium text-xl">URL</span>
            <a
              className="font-light hover:underline"
              href={url}
              target={'_blank'}
            >
              {url}
            </a>
          </div>
        )}
        <div className="flex flex-col w-fit space-y-2">
          <span className="font-medium text-xl">Size</span>
          <span className="font-light">
            {new Decimal(file.size).div(1024).toFixed(2)}KB
          </span>
        </div>
        <div className="flex flex-col w-fit space-y-2">
          <span className="font-medium text-xl">Created At</span>
          <span className="font-light">
            {moment(file.createdAt).format('DD/MM/YYYY HH:MM')}
          </span>
        </div>
        <div className="flex flex-col w-fit space-y-2">
          <span className="font-medium text-xl">Last Updated</span>
          <span className="font-light">
            {moment(file.updatedAt).format('DD/MM/YYYY HH:MM')}
          </span>
        </div>
        <div className="flex flex-col w-fit space-y-4">
          <span className="font-medium text-xl">Path</span>
          <div className="flex">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <span>{file.container}</span>
                </BreadcrumbItem>
                {file.folder
                  .replace(/^\/|\/$/g, '')
                  .split('/')
                  .map(name => {
                    const level = isEmpty(name) ? '/' : name;
                    return (
                      <div className="flex items-center justify-center">
                        <BreadcrumbItem>
                          <BreadcrumbSeparator />
                          <span>{level}</span>
                        </BreadcrumbItem>
                      </div>
                    );
                  })}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </div>
      </div>
    </div>
  );
};
