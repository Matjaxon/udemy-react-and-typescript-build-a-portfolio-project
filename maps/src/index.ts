/// <reference types="@types/google.maps" />

import { User } from './User';
import { Company } from './Company';
import { CustomMap } from './CustomMap';

const customMap = new CustomMap('map');
const user = new User();
const company = new Company();

// Uses generic Mappable interface which both
// User and Company have implemented
customMap.addMarker(user);
customMap.addMarker(company);
