import { Column, CreateDateColumn, Entity, OneToMany, PrimaryColumn } from 'typeorm';

import { Folder } from './folder';
import { Link } from './link';
import { Tag } from './tag';

@Entity()
export class User {
  @PrimaryColumn('uuid')
  id: string;

  @Column()
  username: string;

  @Column()
  password: string;

  @OneToMany(() => Folder, folder => folder.owner, {
    cascade: true,
  })
  folders?: Folder[];

  @OneToMany(() => Tag, tag => tag.owner, {
    cascade: true,
  })
  tags?: Tag[];

  @OneToMany(() => Link, link => link.owner, {
    cascade: true,
  })
  links?: Folder[];

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;
}
