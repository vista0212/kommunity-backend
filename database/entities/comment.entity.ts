import {
  Entity,
  BaseEntity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Board } from './board.entity';

@Entity('comments')
export class Comment extends BaseEntity {
  @PrimaryGeneratedColumn('increment')
  public pk: number;

  @Column({ type: 'uuid', nullable: false })
  public user_pk: string;

  @Column({ type: 'int', nullable: false })
  public board_pk: number;

  @Column({ type: 'text', nullable: false })
  public content: string;

  @Column({ type: 'timestamptz', nullable: false })
  @CreateDateColumn()
  public createdAt: Date;

  @Column({ type: 'timestamptz', nullable: false })
  @UpdateDateColumn()
  public updatedAt: Date;

  @ManyToOne((type) => User, {
    cascade: true,
  })
  @JoinColumn({ name: 'user_pk' })
  public user: User;

  @ManyToOne((type) => Board, {
    cascade: true,
  })
  @JoinColumn({ name: 'board_pk' })
  public board: Board;
}
