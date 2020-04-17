import {
  Entity,
  BaseEntity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Repository,
  OneToMany,
} from 'typeorm';

import { catchDBError } from '../../lib/error';
import { Board } from './board.entity';
import { Comment } from './comment.entity';
import { BoardLike } from './boardLike.entity';

@Entity('users')
export class User extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  public pk: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  public id: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  public password: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  public passwordKey: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  public email: string;

  @Column({ type: 'varchar', length: 6, nullable: true })
  public signKey: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  public name: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  public image: string;

  @Column('timestamptz')
  @CreateDateColumn()
  public createdAt: Date;

  @Column('timestamptz')
  @UpdateDateColumn()
  public updatedAt: Date;

  @OneToMany((type) => Board, (board) => board.user)
  public board: Board[];

  @OneToMany((type) => Comment, (comment) => comment.user)
  public comment: Comment[];

  @OneToMany((type) => BoardLike, (boardLike) => boardLike.user)
  public boardLike: BoardLike[];
}

export const findByPk: (
  userRepository: Repository<User>,
  pk: User['pk']
) => Promise<User> | undefined = async (userRepository, pk) => {
  const user: User = await userRepository
    .findOne({
      where: {
        pk,
      },
    })
    .catch(catchDBError());

  return user;
};

export const findById: (
  userRepository: Repository<User>,
  email: User['id']
) => Promise<User> | undefined = async (userRepository, id) => {
  const user: User = await userRepository
    .findOne({
      where: {
        id,
      },
    })
    .catch(catchDBError());

  return user;
};

export const findByEmail: (
  userRepository: Repository<User>,
  email: User['email']
) => Promise<User> | undefined = async (userRepository, email) => {
  const user: User = await userRepository
    .findOne({
      where: {
        email,
      },
    })
    .catch(catchDBError());

  return user;
};
