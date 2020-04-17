import {
  Entity,
  BaseEntity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { User } from './user.entity';
import { BoardImage } from './boardImage.entity';
import { Comment } from './comment.entity';
import { BoardLike } from './boardLike.entity';

@Entity('boards')
export class Board extends BaseEntity {
  @PrimaryGeneratedColumn('increment')
  public pk: number;

  @Column({ type: 'uuid', nullable: false })
  public user_pk: string;

  @Column({ type: 'text', nullable: false })
  public content: string;

  @Column({ type: 'timestamptz', nullable: false })
  @CreateDateColumn()
  public createdAt: Date;

  @Column({ type: 'timestamptz', nullable: false })
  @UpdateDateColumn()
  public updatedAt: Date;

  @Column({ type: 'timestamptz', nullable: true })
  @DeleteDateColumn()
  public deletedAt: Date;

  @ManyToOne((type) => User, {
    cascade: true,
  })
  @JoinColumn({ name: 'user_pk' })
  public user: User;

  @OneToMany((type) => BoardImage, (boardImage) => boardImage.board)
  public boardImage: BoardImage[];

  @OneToMany((type) => Comment, (comment) => comment.board)
  public comment: Comment[];

  @OneToMany((type) => BoardLike, (boardLike) => boardLike.board)
  public boardLike: BoardLike[];
}
