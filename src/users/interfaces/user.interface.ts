import { ROLES } from "src/common/constants";

export interface IUser {
  name: string;
  last_name: string;
  email: string;
  password: string;
  phone: string;
  country_code: string;
  role: ROLES;
  is_suspended: boolean;
}
