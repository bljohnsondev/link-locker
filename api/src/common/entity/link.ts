import { Column, CreateDateColumn, Entity, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { Folder } from './folder';
import { Tag } from './tag';
import { User } from './user';

@Entity()
export class Link {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar', { length: 1280 })
  title: string;

  // yes 3000 is an arbitrary length - TODO: look into how to use a "text" column in typeorm that will support mysql, postgres and sqlite
  @Column('varchar', { length: 3000 })
  url: string;

  @ManyToOne(() => Folder, folder => folder.links, { onDelete: 'CASCADE' })
  folder?: Folder | null;

  @ManyToMany(() => Tag, tag => tag.links, { cascade: true })
  @JoinTable()
  tags: Tag[];

  @ManyToOne(() => User, user => user.links)
  owner: User;

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;
}
