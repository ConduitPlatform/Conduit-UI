import { Box, Calendar, Code, Hash, Key, Link, List, Type } from 'lucide-react';

export const fieldTypes = [
  { name: 'Boolean', icon: Type },
  { name: 'String', icon: Type },
  { name: 'Number', icon: Hash },
  { name: 'Date', icon: Calendar },
  { name: 'Enum', icon: List },
  { name: 'ObjectId', icon: Key },
  { name: 'Group', icon: Box },
  { name: 'Relation', icon: Link },
  { name: 'JSON', icon: Code },
] as const;

export const enumTypes = ['String', 'Number'] as const;

export const indexTypes = [
  'Single Field',
  'Compound',
  'Text',
  'Geospatial',
] as const;

export const defaultFields = [
  {
    name: '_id',
    type: 'ObjectId',
    required: true,
    unique: true,
    isArray: false,
  },
  {
    name: 'createdAt',
    type: 'Date',
    required: true,
    unique: false,
    isArray: false,
  },
  {
    name: 'updatedAt',
    type: 'Date',
    required: true,
    unique: false,
    isArray: false,
  },
];
