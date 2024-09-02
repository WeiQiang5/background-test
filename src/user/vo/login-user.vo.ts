import { Permission } from '../entities/permission.entity';

interface UserInfo {
  id: number;

  username: string;

  nickName: string;

  email: string;

  headPic: string;

  phoneNumber: string;

  isFrozen: boolean;

  isAdmin: boolean;

  createTime: Date;

  roles: string[];

  permissions: Permission[];
}
export class LoginUserVo {
  userInfo: UserInfo;

  accessToken: string;

  refreshToken: string;
}

export interface ReturnUser {
  id: number;
  username: string;
  isAdmin: boolean;
  roles: string[];
  permissions: Permission[];
}
