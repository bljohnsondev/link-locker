import { Column, CreateDateColumn, Entity, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { Link } from './link';
import { User } from './user';

@Entity()
export class Tag {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @ManyToMany(() => Link, link => link.tags)
  links: Link[];

  @ManyToOne(() => User, user => user.folders)
  owner: User;

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;
}
