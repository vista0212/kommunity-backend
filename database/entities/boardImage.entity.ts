import { Entity, BaseEntity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Board } from './board.entity';

@Entity('boardimages')
export class BoardImage extends BaseEntity {
  @PrimaryGeneratedColumn('increment')
  public pk: number;

  @Column({ type: 'unsigned big int', nullable: false })
  public board_pk: number;

  @Column({ type: 'varchar', length: 255, nullable: false })
  public image: string;

  @ManyToOne((type) => Board, {
    cascade: true,
  })
  @JoinColumn({ name: 'board_pk' })
  public board: Board;
}
