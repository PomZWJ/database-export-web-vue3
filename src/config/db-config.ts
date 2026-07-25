import mysqlIcon from '@/assets/images/mysql-icon-click.png'
import oracleIcon from '@/assets/images/oracle-icon-click.png'
import sqlserverIcon from '@/assets/images/sqlserver-icon-click.png'
import postgresqlIcon from '@/assets/images/postgresql-icon-click.png'
import clickhouseIcon from '@/assets/images/clickhouse-icon-click.png'
import db2Icon from '@/assets/images/db2-icon-click.png'
import dmIcon from '@/assets/images/dm-icon-click.png'
import sqliteIcon from '@/assets/images/sqlite-icon-click.png'

export interface DbConfig {
  /** 显示名称 */
  kind: string
  /** 数据库类型标识（传给后端） */
  dbKind: string
  /** 图标 */
  icon: string
  /** 默认端口 */
  port: number
  /** 默认数据库名 */
  dbName: string
  /** 默认用户名 */
  userName: string
  /** 默认密码 */
  password: string
  /** 默认 schema */
  schemas: string
  /** 是否显示 schema 字段 */
  showSchemas: boolean
  /** schema 是否必填 */
  schemasRequired: boolean
  /** 是否显示连接字段（ip/port/userName/password），sqlite 为 false */
  showConnection: boolean
  /** dbName 字段标签 */
  dbNameLabel: string
  /** dbName 占位符 */
  dbNamePlaceholder: string
}

export const dbConfigs: DbConfig[] = [
  {
    kind: 'Mysql',
    dbKind: 'mysql',
    icon: mysqlIcon,
    port: 3306,
    dbName: 'demo_db',
    userName: 'root',
    password: '123456',
    schemas: '',
    showSchemas: false,
    schemasRequired: false,
    showConnection: true,
    dbNameLabel: '数据库',
    dbNamePlaceholder: '',
  },
  {
    kind: 'Oracle',
    dbKind: 'oracle',
    icon: oracleIcon,
    port: 1521,
    dbName: 'orcl',
    userName: '',
    password: '',
    schemas: '',
    showSchemas: false,
    schemasRequired: false,
    showConnection: true,
    dbNameLabel: '数据库',
    dbNamePlaceholder: '',
  },
  {
    kind: 'Sqlserver',
    dbKind: 'sqlserver',
    icon: sqlserverIcon,
    port: 1433,
    dbName: '',
    userName: 'sa',
    password: '',
    schemas: '',
    showSchemas: false,
    schemasRequired: false,
    showConnection: true,
    dbNameLabel: '数据库',
    dbNamePlaceholder: '',
  },
  {
    kind: 'postgresql',
    dbKind: 'postgresql',
    icon: postgresqlIcon,
    port: 5432,
    dbName: '',
    userName: 'postgres',
    password: '',
    schemas: 'public',
    showSchemas: true,
    schemasRequired: true,
    showConnection: true,
    dbNameLabel: '数据库',
    dbNamePlaceholder: '',
  },
  {
    kind: 'Clickhouse',
    dbKind: 'clickhouse',
    icon: clickhouseIcon,
    port: 8123,
    dbName: '',
    userName: 'default',
    password: '',
    schemas: '',
    showSchemas: false,
    schemasRequired: false,
    showConnection: true,
    dbNameLabel: '数据库',
    dbNamePlaceholder: '',
  },
  {
    kind: 'db2',
    dbKind: 'db2',
    icon: db2Icon,
    port: 50000,
    dbName: '',
    userName: '',
    password: '',
    schemas: '',
    showSchemas: true,
    schemasRequired: false,
    showConnection: true,
    dbNameLabel: '数据库',
    dbNamePlaceholder: '',
  },
  {
    kind: 'DM',
    dbKind: 'dm',
    icon: dmIcon,
    port: 5237,
    dbName: '',
    userName: '',
    password: '',
    schemas: '',
    showSchemas: false,
    schemasRequired: false,
    showConnection: true,
    dbNameLabel: '数据库',
    dbNamePlaceholder: '',
  },
  {
    kind: 'sqlite',
    dbKind: 'sqlite',
    icon: sqliteIcon,
    port: 0,
    dbName: '',
    userName: '',
    password: '',
    schemas: '',
    showSchemas: false,
    schemasRequired: false,
    showConnection: false,
    dbNameLabel: '数据库文件地址',
    dbNamePlaceholder: '仅支持本地文件',
  },
]
