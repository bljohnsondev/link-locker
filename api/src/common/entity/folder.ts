import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { Link } from './link';
import { User } from './user';

@Entity()
export class Folder {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @OneToMany(() => Link, link => link.folder, { cascade: true })
  links?: Link[];

  @ManyToOne(() => User, user => user.folders)
  owner: User;

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;
}
