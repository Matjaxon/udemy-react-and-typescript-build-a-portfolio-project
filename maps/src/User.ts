import { faker } from '@faker-js/faker';
import { Mappable } from './CustomMap';

// This uses an explicit type check. This isn't necessary and
// when it's passed to customMap to addMarker you it can use implicit checks
// so you don't need to go back to every class and explicity say what it implements
// but you can do that to make sure that you are covering all of the interfaces
// you need to satisfy
export class User implements Mappable {
  name: string;
  location: {
    lat: number;
    lng: number;
  };
  color: 'red';

  constructor() {
    this.name = faker.name.firstName();
    this.location = {
      lat: parseFloat(faker.address.latitude()),
      lng: parseFloat(faker.address.longitude())
    };
  }

  getMarkerContent(): string {
    return `User Name: ${this.name}`;
  }
}
