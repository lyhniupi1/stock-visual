# SQLite 数据库元数据报告
生成时间: 2026-02-07 22:49:44

## 数据库基本信息
- SQLite 版本: 3.45.1
- 页面大小: 1024 字节
- 页面数量: 660234
- 总大小: 676,079,616 字节
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

### 表: `stock_a_all_pb`

```sql
CREATE TABLE stock_a_all_pb (
    date TEXT NOT NULL PRIMARY KEY,  -- 日期作为主键
    middlePB REAL,       -- 全部A股市净率中位数
    equalWeightAveragePB REAL,  -- 全部A股市净率等权平均
    close REAL,          -- 上证指数
    quantileInAllHistoryMiddlePB REAL,  -- 当前市净率中位数在历史数据上的分位数
    quantileInRecent10YearsMiddlePB REAL,  -- 当前市净率中位数在最近10年数据上的分位数
    quantileInAllHistoryEqualWeightAveragePB REAL,  -- 当前市净率等权平均在历史数据上的分位数
    quantileInRecent10YearsEqualWeightAveragePB REAL  -- 当前市净率等权平均在最近10年数据上的分位数
)
```

#### 列结构
| 列名 | 类型 | 是否可为空 | 默认值 | 主键 |
|------|------|------------|--------|------|
| date | TEXT | 否 | NULL | 是 |
| middlePB | REAL | 是 | NULL | 否 |
| equalWeightAveragePB | REAL | 是 | NULL | 否 |
| close | REAL | 是 | NULL | 否 |
| quantileInAllHistoryMiddlePB | REAL | 是 | NULL | 否 |
| quantileInRecent10YearsMiddlePB | REAL | 是 | NULL | 否 |
| quantileInAllHistoryEqualWeightAveragePB | REAL | 是 | NULL | 否 |
| quantileInRecent10YearsEqualWeightAveragePB | REAL | 是 | NULL | 否 |

#### 索引
- **sqlite_autoindex_stock_a_all_pb_1** (唯一)
  列: date

---

### 表: `stock_bonus_data`

```sql
CREATE TABLE stock_bonus_data (
    code TEXT NOT NULL,
    codeName TEXT,
    dateStr TEXT NOT NULL,
    bonusData TEXT,
    amount REAL,
    stockDividend REAL,
    PRIMARY KEY (code, dateStr)
)
```

#### 列结构
| 列名 | 类型 | 是否可为空 | 默认值 | 主键 |
|------|------|------------|--------|------|
| code | TEXT | 否 | NULL | 是 |
| codeName | TEXT | 是 | NULL | 否 |
| dateStr | TEXT | 否 | NULL | 是 |
| bonusData | TEXT | 是 | NULL | 否 |
| amount | REAL | 是 | NULL | 否 |
| stockDividend | REAL | 是 | NULL | 否 |

#### 索引
- **sqlite_autoindex_stock_bonus_data_1** (唯一)
  列: code, dateStr

---

### 表: `stock_day_pepb_data`

```sql
CREATE TABLE stock_day_pepb_data (
    date TEXT NOT NULL,
    code TEXT NOT NULL,
    codeName TEXT,
    open REAL,
    high REAL,
    low REAL,
    close REAL,
    preclose REAL,
    volume INTEGER,
    amount REAL,
    adjustflag INTEGER,
    turn REAL,
    tradestatus INTEGER,
    pctChg REAL,
    peTTM REAL,
    pbMRQ REAL,
    psTTM REAL,
    pcfNcfTTM REAL,
    isST INTEGER,
    PRIMARY KEY (code, date)
)
```

#### 列结构
| 列名 | 类型 | 是否可为空 | 默认值 | 主键 |
|------|------|------------|--------|------|
| date | TEXT | 否 | NULL | 是 |
| code | TEXT | 否 | NULL | 是 |
| codeName | TEXT | 是 | NULL | 否 |
| open | REAL | 是 | NULL | 否 |
| high | REAL | 是 | NULL | 否 |
| low | REAL | 是 | NULL | 否 |
| close | REAL | 是 | NULL | 否 |
| preclose | REAL | 是 | NULL | 否 |
| volume | INTEGER | 是 | NULL | 否 |
| amount | REAL | 是 | NULL | 否 |
| adjustflag | INTEGER | 是 | NULL | 否 |
| turn | REAL | 是 | NULL | 否 |
| tradestatus | INTEGER | 是 | NULL | 否 |
| pctChg | REAL | 是 | NULL | 否 |
| peTTM | REAL | 是 | NULL | 否 |
| pbMRQ | REAL | 是 | NULL | 否 |
| psTTM | REAL | 是 | NULL | 否 |
| pcfNcfTTM | REAL | 是 | NULL | 否 |
| isST | INTEGER | 是 | NULL | 否 |

#### 索引
- **sqlite_autoindex_stock_day_pepb_data_1** (唯一)
  列: code, date

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
