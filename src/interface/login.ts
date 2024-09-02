import { Permission } from 'src/user/entities/permission.entity';

export interface JwtUserData {
  userId: number;
  username: string;
  roles: string[];
  permissions: Permission[];
}
