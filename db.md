# SQLite 数据库元数据报告
生成时间: 2026-02-19 22:51:04

## 数据库基本信息
- SQLite 版本: 3.37.2
- 页面大小: 1024 字节
- 页面数量: 1294581
- 总大小: 1,325,650,944 字节
- 编码: UTF-8

## 数据表
共 8 个表

### 表: `ROE_DATA`

```sql
CREATE TABLE ROE_DATA (
    code TEXT NOT NULL,
    codeName TEXT NOT NULL,
    pubDate TEXT NOT NULL,
    statDate TEXT NOT NULL,
    dupontROE REAL,
    dupontAssetStoEquity REAL,
    dupontAssetTurn REAL,
    dupontPnitoni REAL,
    dupontNitogr REAL,
    dupontTaxBurden REAL,
    dupontIntburden REAL,
    dupontEbittogr REAL,
    PRIMARY KEY (code, statDate)
)
```

#### 列结构
| 列名 | 类型 | 是否可为空 | 默认值 | 主键 |
|------|------|------------|--------|------|
| code | TEXT | 否 | NULL | 是 |
| codeName | TEXT | 否 | NULL | 否 |
| pubDate | TEXT | 否 | NULL | 否 |
| statDate | TEXT | 否 | NULL | 是 |
| dupontROE | REAL | 是 | NULL | 否 |
| dupontAssetStoEquity | REAL | 是 | NULL | 否 |
| dupontAssetTurn | REAL | 是 | NULL | 否 |
| dupontPnitoni | REAL | 是 | NULL | 否 |
| dupontNitogr | REAL | 是 | NULL | 否 |
| dupontTaxBurden | REAL | 是 | NULL | 否 |
| dupontIntburden | REAL | 是 | NULL | 否 |
| dupontEbittogr | REAL | 是 | NULL | 否 |

#### 索引
- **sqlite_autoindex_ROE_DATA_1** (唯一)
  列: code, statDate

---

### 表: `hushen300`

```sql
CREATE TABLE hushen300 (
    date TEXT,
    code TEXT,
    open REAL,
    high REAL,
    low REAL,
    close REAL,
    preclose REAL,
    volume INTEGER,
    amount REAL,
    pctChg REAL,
    PRIMARY KEY (date)
)
```

#### 列结构
| 列名 | 类型 | 是否可为空 | 默认值 | 主键 |
|------|------|------------|--------|------|
| date | TEXT | 是 | NULL | 是 |
| code | TEXT | 是 | NULL | 否 |
| open | REAL | 是 | NULL | 否 |
| high | REAL | 是 | NULL | 否 |
| low | REAL | 是 | NULL | 否 |
| close | REAL | 是 | NULL | 否 |
| preclose | REAL | 是 | NULL | 否 |
| volume | INTEGER | 是 | NULL | 否 |
| amount | REAL | 是 | NULL | 否 |
| pctChg | REAL | 是 | NULL | 否 |

#### 索引
- **sqlite_autoindex_hushen300_1** (唯一)
  列: date

---

### 表: `index_valuation_data`

```sql
CREATE TABLE index_valuation_data (
    date TEXT NOT NULL,
    code TEXT NOT NULL,
    codeName TEXT,
    pe REAL,
    pb REAL,
    roe REAL,
    PRIMARY KEY (code, date)
)
```

#### 列结构
| 列名 | 类型 | 是否可为空 | 默认值 | 主键 |
|------|------|------------|--------|------|
| date | TEXT | 否 | NULL | 是 |
| code | TEXT | 否 | NULL | 是 |
| codeName | TEXT | 是 | NULL | 否 |
| pe | REAL | 是 | NULL | 否 |
| pb | REAL | 是 | NULL | 否 |
| roe | REAL | 是 | NULL | 否 |

#### 索引
- **sqlite_autoindex_index_valuation_data_1** (唯一)
  列: code, date

---

### 表: `portfolios`

```sql
CREATE TABLE "portfolios" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" text NOT NULL, "stock_count" integer NOT NULL DEFAULT (0), "stocks" text NOT NULL, "created_at" text NOT NULL, "initial_value" float NOT NULL DEFAULT (0), "current_value" float, "created_time" datetime NOT NULL DEFAULT (datetime('now')), "updated_time" datetime NOT NULL DEFAULT (datetime('now')))
```

#### 列结构
| 列名 | 类型 | 是否可为空 | 默认值 | 主键 |
|------|------|------------|--------|------|
| id | INTEGER | 否 | NULL | 是 |
| name | TEXT | 否 | NULL | 否 |
| stock_count | INTEGER | 否 | 0 | 否 |
| stocks | TEXT | 否 | NULL | 否 |
| created_at | TEXT | 否 | NULL | 否 |
| initial_value | float | 否 | 0 | 否 |
| current_value | float | 是 | NULL | 否 |
| created_time | datetime | 否 | datetime('now') | 否 |
| updated_time | datetime | 否 | datetime('now') | 否 |

---

### 表: `stock_bonus_data`

```sql
CREATE TABLE "stock_bonus_data" ("code" text NOT NULL, "codeName" text, "dateStr" text NOT NULL, "bonusData" text, "amount" float, "stockDividend" float, PRIMARY KEY ("code", "dateStr"))
```

#### 列结构
| 列名 | 类型 | 是否可为空 | 默认值 | 主键 |
|------|------|------------|--------|------|
| code | TEXT | 否 | NULL | 是 |
| codeName | TEXT | 是 | NULL | 否 |
| dateStr | TEXT | 否 | NULL | 是 |
| bonusData | TEXT | 是 | NULL | 否 |
| amount | float | 是 | NULL | 否 |
| stockDividend | float | 是 | NULL | 否 |

#### 索引
- **sqlite_autoindex_stock_bonus_data_1** (唯一)
  列: code, dateStr

---

### 表: `stock_day_pepb_data`

```sql
CREATE TABLE "stock_day_pepb_data" ("date" text NOT NULL, "code" text NOT NULL, "codeName" text, "open" float, "high" float, "low" float, "close" float, "preclose" float, "volume" integer, "amount" float, "adjustflag" integer, "turn" float, "tradestatus" integer, "pctChg" float, "peTTM" float, "pbMRQ" float, "psTTM" float, "pcfNcfTTM" float, "isST" integer, PRIMARY KEY ("date", "code"))
```

#### 列结构
| 列名 | 类型 | 是否可为空 | 默认值 | 主键 |
|------|------|------------|--------|------|
| date | TEXT | 否 | NULL | 是 |
| code | TEXT | 否 | NULL | 是 |
| codeName | TEXT | 是 | NULL | 否 |
| open | float | 是 | NULL | 否 |
| high | float | 是 | NULL | 否 |
| low | float | 是 | NULL | 否 |
| close | float | 是 | NULL | 否 |
| preclose | float | 是 | NULL | 否 |
| volume | INTEGER | 是 | NULL | 否 |
| amount | float | 是 | NULL | 否 |
| adjustflag | INTEGER | 是 | NULL | 否 |
| turn | float | 是 | NULL | 否 |
| tradestatus | INTEGER | 是 | NULL | 否 |
| pctChg | float | 是 | NULL | 否 |
| peTTM | float | 是 | NULL | 否 |
| pbMRQ | float | 是 | NULL | 否 |
| psTTM | float | 是 | NULL | 否 |
| pcfNcfTTM | float | 是 | NULL | 否 |
| isST | INTEGER | 是 | NULL | 否 |

#### 索引
- **sqlite_autoindex_stock_day_pepb_data_1** (唯一)
  列: date, code

---

### 表: `stock_industry_data`

```sql
CREATE TABLE stock_industry_data (
    code TEXT NOT NULL,
    codeName TEXT,
    updateDate TEXT NOT NULL,
    industry TEXT,
    industryClassification TEXT,
    PRIMARY KEY (code)
)
```

#### 列结构
| 列名 | 类型 | 是否可为空 | 默认值 | 主键 |
|------|------|------------|--------|------|
| code | TEXT | 否 | NULL | 是 |
| codeName | TEXT | 是 | NULL | 否 |
| updateDate | TEXT | 否 | NULL | 否 |
| industry | TEXT | 是 | NULL | 否 |
| industryClassification | TEXT | 是 | NULL | 否 |

#### 索引
- **sqlite_autoindex_stock_industry_data_1** (唯一)
  列: code

---

### 表: `zz500`

```sql
CREATE TABLE zz500 (
    date TEXT,
    code TEXT,
    open REAL,
    high REAL,
    low REAL,
    close REAL,
    preclose REAL,
    volume INTEGER,
    amount REAL,
    pctChg REAL,
    PRIMARY KEY (date)
)
```

#### 列结构
| 列名 | 类型 | 是否可为空 | 默认值 | 主键 |
|------|------|------------|--------|------|
| date | TEXT | 是 | NULL | 是 |
| code | TEXT | 是 | NULL | 否 |
| open | REAL | 是 | NULL | 否 |
| high | REAL | 是 | NULL | 否 |
| low | REAL | 是 | NULL | 否 |
| close | REAL | 是 | NULL | 否 |
| preclose | REAL | 是 | NULL | 否 |
| volume | INTEGER | 是 | NULL | 否 |
| amount | REAL | 是 | NULL | 否 |
| pctChg | REAL | 是 | NULL | 否 |

#### 索引
- **sqlite_autoindex_zz500_1** (唯一)
  列: date

---
