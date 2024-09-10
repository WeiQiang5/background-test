import { Permission } from 'src/user/entities/permission.entity';

export interface JwtUserData {
  userId: number;
  username: string;
  email: string;
  roles: string[];
  permissions: Permission[];
}
