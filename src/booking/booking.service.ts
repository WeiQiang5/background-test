import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { User } from 'src/user/entities/user.entity';
import { MeetingRoom } from 'src/meeting/entities/meeting.entity';
import {
  Between,
  EntityManager,
  LessThanOrEqual,
  Like,
  MoreThanOrEqual,
} from 'typeorm';
import { InjectEntityManager } from '@nestjs/typeorm';
import { Booking, Status } from './entities/booking.entity';
import { ListBookingDto } from './dto/list-booking.dto';
import { CreateBookingDto } from './dto/create-booking.dto';
import { RedisService } from 'src/redis/redis.service';
import { EmailService } from 'src/email/email.service';

@Injectable()
export class BookingService {
  @InjectEntityManager()
  private entityManager: EntityManager;

  @Inject(RedisService)
  private redisService: RedisService;

  @Inject(EmailService)
  private emailService: EmailService;

  async initData() {
    const user1 = await this.entityManager.findOneBy(User, {
      id: 1,
    });
    const user2 = await this.entityManager.findOneBy(User, {
      id: 2,
    });

    const room1 = await this.entityManager.findOneBy(MeetingRoom, {
      id: 3,
    });
    const room2 = await await this.entityManager.findOneBy(MeetingRoom, {
      id: 6,
    });

    const booking1 = new Booking();
    booking1.room = room1;
    booking1.user = user1;
    booking1.startTime = new Date();
    booking1.endTime = new Date(Date.now() + 1000 * 60 * 60);

    await this.entityManager.save(Booking, booking1);

    const booking2 = new Booking();
    booking2.room = room2;
    booking2.user = user2;
    booking2.startTime = new Date();
    booking2.endTime = new Date(Date.now() + 1000 * 60 * 60);

    await this.entityManager.save(Booking, booking2);

    const booking3 = new Booking();
    booking3.room = room1;
    booking3.user = user2;
    booking3.startTime = new Date();
    booking3.endTime = new Date(Date.now() + 1000 * 60 * 60);

    await this.entityManager.save(Booking, booking3);

    const booking4 = new Booking();
    booking4.room = room2;
    booking4.user = user1;
    booking4.startTime = new Date();
    booking4.endTime = new Date(Date.now() + 1000 * 60 * 60);

    await this.entityManager.save(Booking, booking4);
  }

  async find(listBookingDto: ListBookingDto) {
    const skipCount = (listBookingDto.pageNo - 1) * listBookingDto.pageSize;

    const condition: Record<string, any> = {};

    if (listBookingDto.username && listBookingDto.username.trim() !== '') {
      condition.username = Like(`${listBookingDto.username}`);
    }
    if (
      listBookingDto.meetingRoomName &&
      listBookingDto.meetingRoomName.trim() !== ''
    ) {
      condition.meetingRoomName = Like(`${listBookingDto.meetingRoomName}`);
    }
    if (
      listBookingDto.meetingRoomPosition &&
      listBookingDto.meetingRoomPosition.trim() !== ''
    ) {
      condition.meetingRoomPosition = Like(
        `listBookingDto.meetingRoomPosition`,
      );
    }
    if (
      listBookingDto.bookingTimeRangeStart &&
      listBookingDto.bookingTimeRangeEnd
    ) {
      condition.startTime = Between(
        new Date(listBookingDto.bookingTimeRangeStart),
        new Date(listBookingDto.bookingTimeRangeEnd),
      );
    }

    const [bookings, totalCount] = await this.entityManager.findAndCount(
      Booking,
      {
        where: {
          user: {
            username: condition.username,
          },
          room: {
            name: condition.meetingRoomName,
            location: condition.meetingRoomPosition,
          },
          startTime: condition.startTime,
        },
        relations: {
          user: true,
          room: true,
        },
        skip: skipCount,
        take: listBookingDto.pageSize,
      },
    );

    return {
      list: bookings.map((item) => {
        if (item.user) {
          delete item.user.password;
        }

        return item;
      }),
      total: totalCount,
    };
  }

  async add(bookingDto: CreateBookingDto, userId: number) {
    const meetingRoom = await this.entityManager.findOneBy(MeetingRoom, {
      id: bookingDto.meetingRoomId,
    });

    if (!meetingRoom) {
      throw new BadRequestException('会议室不存在');
    }

    const user = await this.entityManager.findOneBy(User, {
      id: userId,
    });

    const booking = new Booking();
    booking.room = meetingRoom;
    booking.user = user;
    booking.startTime = new Date(booking.startTime);
    booking.endTime = new Date(booking.endTime);

    const res = await this.entityManager.findOneBy(Booking, {
      room: meetingRoom,
      startTime: LessThanOrEqual(booking.startTime),
      endTime: MoreThanOrEqual(booking.endTime),
    });

    if (res) {
      throw new BadRequestException('该时间段已被预定');
    }

    await this.entityManager.save(Booking, booking);
  }

  async urge(id: number) {
    const flag = await this.redisService.get('urge_' + id);

    if (flag) {
      return '半小时只能催办一次，请耐心等待';
    }

    let email = await this.redisService.get('admin_email');
    if (!email) {
      const admin = await this.entityManager.findOne(User, {
        select: {
          email: true,
        },
        where: {
          isAdmin: true,
        },
      });

      email = admin.email;

      this.redisService.set('admin_email', admin.email);
    }

    this.emailService.sendMail({
      to: email,
      subject: '预定申请催办提醒',
      html: `id 为 ${id} 的预定申请正在等待审批`,
    });

    this.redisService.set('urge_' + id, 1, 60 * 30);
  }
  async changeStatus(id: number, status) {
    await this.entityManager.update(
      Booking,
      {
        id,
      },
      {
        status,
      },
    );
  }
  async apply(id: number) {
    await this.changeStatus(id, Status.APPROVED);
    return Status.APPROVED;
  }

  async reject(id: number) {
    await this.changeStatus(id, Status.REJECTED);
    return Status.REJECTED;
  }

  async unbind(id: number) {
    await this.changeStatus(id, Status.RESOLVED);
    return Status.RESOLVED;
  }
}
