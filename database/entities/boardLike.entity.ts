import { Entity, BaseEntity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Board } from './board.entity';
import { User } from './user.entity';

@Entity('boardlikes')
export class BoardLike extends BaseEntity {
  @PrimaryGeneratedColumn('increment')
  public pk: number;

  @Column({ type: 'uuid', nullable: false })
  public user_pk: string;

  @Column({ type: 'int', nullable: false })
  public board_pk: number;

  @ManyToOne((type) => Board, {
    cascade: true,
  })
  @JoinColumn({ name: 'board_pk' })
  public board: Board;

  @ManyToOne((type) => User, {
    cascade: true,
  })
  @JoinColumn({ name: 'user_pk' })
  public user: User;
}
