import { MeetingRoom } from 'src/meeting/entities/meeting.entity';
import { User } from 'src/user/entities/user.entity';
import { dateTransformer } from 'src/utils/time';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

// 定义状态枚举
export enum Status {
  PENDING = '申请中',
  APPROVED = '审批通过',
  REJECTED = '审批驳回',
  RESOLVED = '已解除',
}

@Entity()
export class Booking {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    comment: '会议开始时间',
    transformer: dateTransformer,
  })
  startTime: Date;

  @Column({
    comment: '会议结束时间',
    transformer: dateTransformer,
  })
  endTime: Date;

  @Column({
    type: 'enum',
    enum: Status,
    default: Status.PENDING,
    comment: '状态（申请中、审批通过、审批驳回、已解除）',
  })
  status: Status;

  @Column({
    length: 100,
    comment: '备注',
    default: '',
  })
  note: string;

  @ManyToOne(() => User)
  user: User;

  @ManyToOne(() => MeetingRoom)
  room: MeetingRoom;

  @CreateDateColumn({
    comment: '创建时间',
  })
  createTime: Date;

  @UpdateDateColumn({
    comment: '更新时间',
  })
  updateTime: Date;
}
