# SQLite 数据库元数据报告
生成时间: 2026-03-19 19:37:15

## 数据库基本信息
- SQLite 版本: 3.45.1
- 页面大小: 1024 字节
- 页面数量: 1106315
- 总大小: 1,132,866,560 字节
- 编码: UTF-8

## 数据表
共 19 个表

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

### 表: `eastmoney_balance_sheet`

```sql
CREATE TABLE "eastmoney_balance_sheet" (
                "SECUCODE" TEXT, "SECURITY_NAME_ABBR" TEXT, "REPORT_DATE" TEXT, "REPORT_TYPE" TEXT, "REPORT_DATE_NAME" TEXT, "NOTICE_DATE" TEXT, "UPDATE_DATE" TEXT, "MONETARYFUNDS" TEXT, "LEND_FUND" TEXT, "TRADE_FINASSET" TEXT, "NOTE_ACCOUNTS_RECE" TEXT, "NOTE_RECE" TEXT, "ACCOUNTS_RECE" TEXT, "PREPAYMENT" TEXT, "OTHER_RECE" TEXT, "BUY_RESALE_FINASSET" TEXT, "INVENTORY" TEXT, "NONCURRENT_ASSET_1YEAR" TEXT, "OTHER_CURRENT_ASSET" TEXT, "TOTAL_CURRENT_ASSETS" TEXT, "LOAN_ADVANCE" TEXT, "CREDITOR_INVEST" TEXT, "OTHER_CREDITOR_INVEST" TEXT, "OTHER_NONCURRENT_FINASSET" TEXT, "INVEST_REALESTATE" TEXT, "FIXED_ASSET" TEXT, "CIP" TEXT, "USERIGHT_ASSET" TEXT, "INTANGIBLE_ASSET" TEXT, "DEVELOP_EXPENSE" TEXT, "LONG_PREPAID_EXPENSE" TEXT, "DEFER_TAX_ASSET" TEXT, "OTHER_NONCURRENT_ASSET" TEXT, "TOTAL_NONCURRENT_ASSETS" TEXT, "TOTAL_ASSETS" TEXT, "ACCEPT_DEPOSIT_INTERBANK" TEXT, "NOTE_ACCOUNTS_PAYABLE" TEXT, "ACCOUNTS_PAYABLE" TEXT, "CONTRACT_LIAB" TEXT, "STAFF_SALARY_PAYABLE" TEXT, "TAX_PAYABLE" TEXT, "OTHER_PAYABLE" TEXT, "DIVIDEND_PAYABLE" TEXT, "NONCURRENT_LIAB_1YEAR" TEXT, "OTHER_CURRENT_LIAB" TEXT, "TOTAL_CURRENT_LIAB" TEXT, "LEASE_LIAB" TEXT, "DEFER_TAX_LIAB" TEXT, "TOTAL_NONCURRENT_LIAB" TEXT, "TOTAL_LIABILITIES" TEXT, "SHARE_CAPITAL" TEXT, "CAPITAL_RESERVE" TEXT, "TREASURY_SHARES" TEXT, "OTHER_COMPRE_INCOME" TEXT, "SURPLUS_RESERVE" TEXT, "GENERAL_RISK_RESERVE" TEXT, "UNASSIGN_RPOFIT" TEXT, "TOTAL_PARENT_EQUITY" TEXT, "MINORITY_EQUITY" TEXT, "TOTAL_EQUITY" TEXT, "TOTAL_LIAB_EQUITY" TEXT, "OPINION_TYPE" TEXT, PRIMARY KEY ("SECUCODE", "REPORT_DATE")
            )
```

#### 列结构
| 列名 | 类型 | 是否可为空 | 默认值 | 主键 |
|------|------|------------|--------|------|
| SECUCODE | TEXT | 是 | NULL | 是 |
| SECURITY_NAME_ABBR | TEXT | 是 | NULL | 否 |
| REPORT_DATE | TEXT | 是 | NULL | 是 |
| REPORT_TYPE | TEXT | 是 | NULL | 否 |
| REPORT_DATE_NAME | TEXT | 是 | NULL | 否 |
| NOTICE_DATE | TEXT | 是 | NULL | 否 |
| UPDATE_DATE | TEXT | 是 | NULL | 否 |
| MONETARYFUNDS | TEXT | 是 | NULL | 否 |
| LEND_FUND | TEXT | 是 | NULL | 否 |
| TRADE_FINASSET | TEXT | 是 | NULL | 否 |
| NOTE_ACCOUNTS_RECE | TEXT | 是 | NULL | 否 |
| NOTE_RECE | TEXT | 是 | NULL | 否 |
| ACCOUNTS_RECE | TEXT | 是 | NULL | 否 |
| PREPAYMENT | TEXT | 是 | NULL | 否 |
| OTHER_RECE | TEXT | 是 | NULL | 否 |
| BUY_RESALE_FINASSET | TEXT | 是 | NULL | 否 |
| INVENTORY | TEXT | 是 | NULL | 否 |
| NONCURRENT_ASSET_1YEAR | TEXT | 是 | NULL | 否 |
| OTHER_CURRENT_ASSET | TEXT | 是 | NULL | 否 |
| TOTAL_CURRENT_ASSETS | TEXT | 是 | NULL | 否 |
| LOAN_ADVANCE | TEXT | 是 | NULL | 否 |
| CREDITOR_INVEST | TEXT | 是 | NULL | 否 |
| OTHER_CREDITOR_INVEST | TEXT | 是 | NULL | 否 |
| OTHER_NONCURRENT_FINASSET | TEXT | 是 | NULL | 否 |
| INVEST_REALESTATE | TEXT | 是 | NULL | 否 |
| FIXED_ASSET | TEXT | 是 | NULL | 否 |
| CIP | TEXT | 是 | NULL | 否 |
| USERIGHT_ASSET | TEXT | 是 | NULL | 否 |
| INTANGIBLE_ASSET | TEXT | 是 | NULL | 否 |
| DEVELOP_EXPENSE | TEXT | 是 | NULL | 否 |
| LONG_PREPAID_EXPENSE | TEXT | 是 | NULL | 否 |
| DEFER_TAX_ASSET | TEXT | 是 | NULL | 否 |
| OTHER_NONCURRENT_ASSET | TEXT | 是 | NULL | 否 |
| TOTAL_NONCURRENT_ASSETS | TEXT | 是 | NULL | 否 |
| TOTAL_ASSETS | TEXT | 是 | NULL | 否 |
| ACCEPT_DEPOSIT_INTERBANK | TEXT | 是 | NULL | 否 |
| NOTE_ACCOUNTS_PAYABLE | TEXT | 是 | NULL | 否 |
| ACCOUNTS_PAYABLE | TEXT | 是 | NULL | 否 |
| CONTRACT_LIAB | TEXT | 是 | NULL | 否 |
| STAFF_SALARY_PAYABLE | TEXT | 是 | NULL | 否 |
| TAX_PAYABLE | TEXT | 是 | NULL | 否 |
| OTHER_PAYABLE | TEXT | 是 | NULL | 否 |
| DIVIDEND_PAYABLE | TEXT | 是 | NULL | 否 |
| NONCURRENT_LIAB_1YEAR | TEXT | 是 | NULL | 否 |
| OTHER_CURRENT_LIAB | TEXT | 是 | NULL | 否 |
| TOTAL_CURRENT_LIAB | TEXT | 是 | NULL | 否 |
| LEASE_LIAB | TEXT | 是 | NULL | 否 |
| DEFER_TAX_LIAB | TEXT | 是 | NULL | 否 |
| TOTAL_NONCURRENT_LIAB | TEXT | 是 | NULL | 否 |
| TOTAL_LIABILITIES | TEXT | 是 | NULL | 否 |
| SHARE_CAPITAL | TEXT | 是 | NULL | 否 |
| CAPITAL_RESERVE | TEXT | 是 | NULL | 否 |
| TREASURY_SHARES | TEXT | 是 | NULL | 否 |
| OTHER_COMPRE_INCOME | TEXT | 是 | NULL | 否 |
| SURPLUS_RESERVE | TEXT | 是 | NULL | 否 |
| GENERAL_RISK_RESERVE | TEXT | 是 | NULL | 否 |
| UNASSIGN_RPOFIT | TEXT | 是 | NULL | 否 |
| TOTAL_PARENT_EQUITY | TEXT | 是 | NULL | 否 |
| MINORITY_EQUITY | TEXT | 是 | NULL | 否 |
| TOTAL_EQUITY | TEXT | 是 | NULL | 否 |
| TOTAL_LIAB_EQUITY | TEXT | 是 | NULL | 否 |
| OPINION_TYPE | TEXT | 是 | NULL | 否 |

#### 索引
- **sqlite_autoindex_eastmoney_balance_sheet_1** (唯一)
  列: SECUCODE, REPORT_DATE

---

### 表: `eastmoney_cash_flow`

```sql
CREATE TABLE "eastmoney_cash_flow" (
                "SECUCODE" TEXT, "SECURITY_NAME_ABBR" TEXT, "REPORT_DATE" TEXT, "REPORT_TYPE" TEXT, "REPORT_DATE_NAME" TEXT, "NOTICE_DATE" TEXT, "UPDATE_DATE" TEXT, "SALES_SERVICES" TEXT, "DEPOSIT_INTERBANK_ADD" TEXT, "RECEIVE_INTEREST_COMMISSION" TEXT, "RECEIVE_TAX_REFUND" TEXT, "RECEIVE_OTHER_OPERATE" TEXT, "TOTAL_OPERATE_INFLOW" TEXT, "BUY_SERVICES" TEXT, "LOAN_ADVANCE_ADD" TEXT, "PBC_INTERBANK_ADD" TEXT, "PAY_INTEREST_COMMISSION" TEXT, "PAY_STAFF_CASH" TEXT, "PAY_ALL_TAX" TEXT, "PAY_OTHER_OPERATE" TEXT, "OPERATE_OUTFLOW_OTHER" TEXT, "TOTAL_OPERATE_OUTFLOW" TEXT, "NETCASH_OPERATE" TEXT, "WITHDRAW_INVEST" TEXT, "RECEIVE_INVEST_INCOME" TEXT, "DISPOSAL_LONG_ASSET" TEXT, "RECEIVE_OTHER_INVEST" TEXT, "TOTAL_INVEST_INFLOW" TEXT, "CONSTRUCT_LONG_ASSET" TEXT, "INVEST_PAY_CASH" TEXT, "PAY_OTHER_INVEST" TEXT, "TOTAL_INVEST_OUTFLOW" TEXT, "NETCASH_INVEST" TEXT, "TOTAL_FINANCE_INFLOW" TEXT, "ASSIGN_DIVIDEND_PORFIT" TEXT, "SUBSIDIARY_PAY_DIVIDEND" TEXT, "PAY_OTHER_FINANCE" TEXT, "TOTAL_FINANCE_OUTFLOW" TEXT, "NETCASH_FINANCE" TEXT, "RATE_CHANGE_EFFECT" TEXT, "CCE_ADD" TEXT, "BEGIN_CCE" TEXT, "END_CCE" TEXT, "NETPROFIT" TEXT, "FA_IR_DEPR" TEXT, "OILGAS_BIOLOGY_DEPR" TEXT, "USERIGHT_ASSET_AMORTIZE" TEXT, "IA_AMORTIZE" TEXT, "LPE_AMORTIZE" TEXT, "DISPOSAL_LONGASSET_LOSS" TEXT, "FA_SCRAP_LOSS" TEXT, "FAIRVALUE_CHANGE_LOSS" TEXT, "FINANCE_EXPENSE" TEXT, "INVEST_LOSS" TEXT, "DEFER_TAX" TEXT, "DT_ASSET_REDUCE" TEXT, "DT_LIAB_ADD" TEXT, "INVENTORY_REDUCE" TEXT, "OPERATE_RECE_REDUCE" TEXT, "OPERATE_PAYABLE_ADD" TEXT, "NETCASH_OPERATENOTE" TEXT, "END_CASH" TEXT, "BEGIN_CASH" TEXT, "END_CASH_EQUIVALENTS" TEXT, "BEGIN_CASH_EQUIVALENTS" TEXT, "CCE_ADDNOTE" TEXT, "OPINION_TYPE" TEXT, PRIMARY KEY ("SECUCODE", "REPORT_DATE")
            )
```

#### 列结构
| 列名 | 类型 | 是否可为空 | 默认值 | 主键 |
|------|------|------------|--------|------|
| SECUCODE | TEXT | 是 | NULL | 是 |
| SECURITY_NAME_ABBR | TEXT | 是 | NULL | 否 |
| REPORT_DATE | TEXT | 是 | NULL | 是 |
| REPORT_TYPE | TEXT | 是 | NULL | 否 |
| REPORT_DATE_NAME | TEXT | 是 | NULL | 否 |
| NOTICE_DATE | TEXT | 是 | NULL | 否 |
| UPDATE_DATE | TEXT | 是 | NULL | 否 |
| SALES_SERVICES | TEXT | 是 | NULL | 否 |
| DEPOSIT_INTERBANK_ADD | TEXT | 是 | NULL | 否 |
| RECEIVE_INTEREST_COMMISSION | TEXT | 是 | NULL | 否 |
| RECEIVE_TAX_REFUND | TEXT | 是 | NULL | 否 |
| RECEIVE_OTHER_OPERATE | TEXT | 是 | NULL | 否 |
| TOTAL_OPERATE_INFLOW | TEXT | 是 | NULL | 否 |
| BUY_SERVICES | TEXT | 是 | NULL | 否 |
| LOAN_ADVANCE_ADD | TEXT | 是 | NULL | 否 |
| PBC_INTERBANK_ADD | TEXT | 是 | NULL | 否 |
| PAY_INTEREST_COMMISSION | TEXT | 是 | NULL | 否 |
| PAY_STAFF_CASH | TEXT | 是 | NULL | 否 |
| PAY_ALL_TAX | TEXT | 是 | NULL | 否 |
| PAY_OTHER_OPERATE | TEXT | 是 | NULL | 否 |
| OPERATE_OUTFLOW_OTHER | TEXT | 是 | NULL | 否 |
| TOTAL_OPERATE_OUTFLOW | TEXT | 是 | NULL | 否 |
| NETCASH_OPERATE | TEXT | 是 | NULL | 否 |
| WITHDRAW_INVEST | TEXT | 是 | NULL | 否 |
| RECEIVE_INVEST_INCOME | TEXT | 是 | NULL | 否 |
| DISPOSAL_LONG_ASSET | TEXT | 是 | NULL | 否 |
| RECEIVE_OTHER_INVEST | TEXT | 是 | NULL | 否 |
| TOTAL_INVEST_INFLOW | TEXT | 是 | NULL | 否 |
| CONSTRUCT_LONG_ASSET | TEXT | 是 | NULL | 否 |
| INVEST_PAY_CASH | TEXT | 是 | NULL | 否 |
| PAY_OTHER_INVEST | TEXT | 是 | NULL | 否 |
| TOTAL_INVEST_OUTFLOW | TEXT | 是 | NULL | 否 |
| NETCASH_INVEST | TEXT | 是 | NULL | 否 |
| TOTAL_FINANCE_INFLOW | TEXT | 是 | NULL | 否 |
| ASSIGN_DIVIDEND_PORFIT | TEXT | 是 | NULL | 否 |
| SUBSIDIARY_PAY_DIVIDEND | TEXT | 是 | NULL | 否 |
| PAY_OTHER_FINANCE | TEXT | 是 | NULL | 否 |
| TOTAL_FINANCE_OUTFLOW | TEXT | 是 | NULL | 否 |
| NETCASH_FINANCE | TEXT | 是 | NULL | 否 |
| RATE_CHANGE_EFFECT | TEXT | 是 | NULL | 否 |
| CCE_ADD | TEXT | 是 | NULL | 否 |
| BEGIN_CCE | TEXT | 是 | NULL | 否 |
| END_CCE | TEXT | 是 | NULL | 否 |
| NETPROFIT | TEXT | 是 | NULL | 否 |
| FA_IR_DEPR | TEXT | 是 | NULL | 否 |
| OILGAS_BIOLOGY_DEPR | TEXT | 是 | NULL | 否 |
| USERIGHT_ASSET_AMORTIZE | TEXT | 是 | NULL | 否 |
| IA_AMORTIZE | TEXT | 是 | NULL | 否 |
| LPE_AMORTIZE | TEXT | 是 | NULL | 否 |
| DISPOSAL_LONGASSET_LOSS | TEXT | 是 | NULL | 否 |
| FA_SCRAP_LOSS | TEXT | 是 | NULL | 否 |
| FAIRVALUE_CHANGE_LOSS | TEXT | 是 | NULL | 否 |
| FINANCE_EXPENSE | TEXT | 是 | NULL | 否 |
| INVEST_LOSS | TEXT | 是 | NULL | 否 |
| DEFER_TAX | TEXT | 是 | NULL | 否 |
| DT_ASSET_REDUCE | TEXT | 是 | NULL | 否 |
| DT_LIAB_ADD | TEXT | 是 | NULL | 否 |
| INVENTORY_REDUCE | TEXT | 是 | NULL | 否 |
| OPERATE_RECE_REDUCE | TEXT | 是 | NULL | 否 |
| OPERATE_PAYABLE_ADD | TEXT | 是 | NULL | 否 |
| NETCASH_OPERATENOTE | TEXT | 是 | NULL | 否 |
| END_CASH | TEXT | 是 | NULL | 否 |
| BEGIN_CASH | TEXT | 是 | NULL | 否 |
| END_CASH_EQUIVALENTS | TEXT | 是 | NULL | 否 |
| BEGIN_CASH_EQUIVALENTS | TEXT | 是 | NULL | 否 |
| CCE_ADDNOTE | TEXT | 是 | NULL | 否 |
| OPINION_TYPE | TEXT | 是 | NULL | 否 |

#### 索引
- **sqlite_autoindex_eastmoney_cash_flow_1** (唯一)
  列: SECUCODE, REPORT_DATE

---

### 表: `eastmoney_dividend_ratio`

```sql
CREATE TABLE "eastmoney_dividend_ratio" (
                "SECUCODE" TEXT, "SECURITY_NAME_ABBR" TEXT, "REPORT_DATE" TEXT, "PARENTNETPROFIT" TEXT, "DIVIDEND_IMPLE" TEXT, "DIVIDEND_PLAN" TEXT, "DIVIDEND_PAY_IMPLE" TEXT, "DIVIDEND_PAY_PLAN" TEXT, PRIMARY KEY ("SECUCODE", "REPORT_DATE")
            )
```

#### 列结构
| 列名 | 类型 | 是否可为空 | 默认值 | 主键 |
|------|------|------------|--------|------|
| SECUCODE | TEXT | 是 | NULL | 是 |
| SECURITY_NAME_ABBR | TEXT | 是 | NULL | 否 |
| REPORT_DATE | TEXT | 是 | NULL | 是 |
| PARENTNETPROFIT | TEXT | 是 | NULL | 否 |
| DIVIDEND_IMPLE | TEXT | 是 | NULL | 否 |
| DIVIDEND_PLAN | TEXT | 是 | NULL | 否 |
| DIVIDEND_PAY_IMPLE | TEXT | 是 | NULL | 否 |
| DIVIDEND_PAY_PLAN | TEXT | 是 | NULL | 否 |

#### 索引
- **sqlite_autoindex_eastmoney_dividend_ratio_1** (唯一)
  列: SECUCODE, REPORT_DATE

---

### 表: `eastmoney_dupont_analysis`

```sql
CREATE TABLE "eastmoney_dupont_analysis" (
                "SECUCODE" TEXT, "SECURITY_NAME_ABBR" TEXT, "REPORT_DATE" TEXT, "REPORT_TYPE" TEXT, "REPORT_DATE_NAME" TEXT, "NOTICE_DATE" TEXT, "UPDATE_DATE" TEXT, "ROE" TEXT, "JROA" TEXT, "PARENT_NETPROFIT_RATIO" TEXT, "EQUITY_MULTIPLIER" TEXT, "SALE_NPR" TEXT, "TOTAL_ASSETS_TR" TEXT, "DEBT_ASSET_RATIO" TEXT, "NETPROFIT" TEXT, "TOTAL_OPERATE_INCOME" TEXT, "TOTAL_LIABILITIES" TEXT, "TOTAL_ASSETS" TEXT, "TOTAL_INCOME" TEXT, "TOTAL_COST" TEXT, "TOTAL_CURRENT_ASSETS" TEXT, "TOTAL_NONCURRENT_ASSETS" TEXT, "OPERATE_COST" TEXT, "TOTAL_EXPENSE" TEXT, "MONETARYFUNDS" TEXT, "CREDITOR_INVEST" TEXT, "USERIGHT_ASSET" TEXT, "INTANGIBLE_ASSET" TEXT, "INVEST_INCOME" TEXT, "OPERATE_TAX_ADD" TEXT, "TRADE_FINASSET" TEXT, "OTHER_CREDITOR_INVEST" TEXT, "FINANCE_EXPENSE" TEXT, "FAIRVALUE_CHANGE_INCOME" TEXT, "NOTE_RECE" TEXT, "OTHER_EQUITY_INVEST" TEXT, "DEVELOP_EXPENSE" TEXT, "SALE_EXPENSE" TEXT, "ASSET_DISPOSAL_INCOME" TEXT, "ASSET_IMPAIRMENT_INCOME" TEXT, "ACCOUNTS_RECE" TEXT, "LONG_RECE" TEXT, "GOODWILL" TEXT, "MANAGE_EXPENSE" TEXT, "EXCHANGE_INCOME" TEXT, "CREDIT_IMPAIRMENT_INCOME" TEXT, "FINANCE_RECE" TEXT, "LONG_EQUITY_INVEST" TEXT, "LONG_PREPAID_EXPENSE" TEXT, "RESEARCH_EXPENSE" TEXT, "NONBUSINESS_EXPENSE" TEXT, "OTHER_RECE" TEXT, "INVEST_REALESTATE" TEXT, "DEFER_TAX_ASSET" TEXT, "INVENTORY" TEXT, "FIXED_ASSET" TEXT, "AVAILABLE_SALE_FINASSET" TEXT, "CIP" TEXT, "HOLD_MATURITY_INVEST" TEXT, PRIMARY KEY ("SECUCODE", "REPORT_DATE")
            )
```

#### 列结构
| 列名 | 类型 | 是否可为空 | 默认值 | 主键 |
|------|------|------------|--------|------|
| SECUCODE | TEXT | 是 | NULL | 是 |
| SECURITY_NAME_ABBR | TEXT | 是 | NULL | 否 |
| REPORT_DATE | TEXT | 是 | NULL | 是 |
| REPORT_TYPE | TEXT | 是 | NULL | 否 |
| REPORT_DATE_NAME | TEXT | 是 | NULL | 否 |
| NOTICE_DATE | TEXT | 是 | NULL | 否 |
| UPDATE_DATE | TEXT | 是 | NULL | 否 |
| ROE | TEXT | 是 | NULL | 否 |
| JROA | TEXT | 是 | NULL | 否 |
| PARENT_NETPROFIT_RATIO | TEXT | 是 | NULL | 否 |
| EQUITY_MULTIPLIER | TEXT | 是 | NULL | 否 |
| SALE_NPR | TEXT | 是 | NULL | 否 |
| TOTAL_ASSETS_TR | TEXT | 是 | NULL | 否 |
| DEBT_ASSET_RATIO | TEXT | 是 | NULL | 否 |
| NETPROFIT | TEXT | 是 | NULL | 否 |
| TOTAL_OPERATE_INCOME | TEXT | 是 | NULL | 否 |
| TOTAL_LIABILITIES | TEXT | 是 | NULL | 否 |
| TOTAL_ASSETS | TEXT | 是 | NULL | 否 |
| TOTAL_INCOME | TEXT | 是 | NULL | 否 |
| TOTAL_COST | TEXT | 是 | NULL | 否 |
| TOTAL_CURRENT_ASSETS | TEXT | 是 | NULL | 否 |
| TOTAL_NONCURRENT_ASSETS | TEXT | 是 | NULL | 否 |
| OPERATE_COST | TEXT | 是 | NULL | 否 |
| TOTAL_EXPENSE | TEXT | 是 | NULL | 否 |
| MONETARYFUNDS | TEXT | 是 | NULL | 否 |
| CREDITOR_INVEST | TEXT | 是 | NULL | 否 |
| USERIGHT_ASSET | TEXT | 是 | NULL | 否 |
| INTANGIBLE_ASSET | TEXT | 是 | NULL | 否 |
| INVEST_INCOME | TEXT | 是 | NULL | 否 |
| OPERATE_TAX_ADD | TEXT | 是 | NULL | 否 |
| TRADE_FINASSET | TEXT | 是 | NULL | 否 |
| OTHER_CREDITOR_INVEST | TEXT | 是 | NULL | 否 |
| FINANCE_EXPENSE | TEXT | 是 | NULL | 否 |
| FAIRVALUE_CHANGE_INCOME | TEXT | 是 | NULL | 否 |
| NOTE_RECE | TEXT | 是 | NULL | 否 |
| OTHER_EQUITY_INVEST | TEXT | 是 | NULL | 否 |
| DEVELOP_EXPENSE | TEXT | 是 | NULL | 否 |
| SALE_EXPENSE | TEXT | 是 | NULL | 否 |
| ASSET_DISPOSAL_INCOME | TEXT | 是 | NULL | 否 |
| ASSET_IMPAIRMENT_INCOME | TEXT | 是 | NULL | 否 |
| ACCOUNTS_RECE | TEXT | 是 | NULL | 否 |
| LONG_RECE | TEXT | 是 | NULL | 否 |
| GOODWILL | TEXT | 是 | NULL | 否 |
| MANAGE_EXPENSE | TEXT | 是 | NULL | 否 |
| EXCHANGE_INCOME | TEXT | 是 | NULL | 否 |
| CREDIT_IMPAIRMENT_INCOME | TEXT | 是 | NULL | 否 |
| FINANCE_RECE | TEXT | 是 | NULL | 否 |
| LONG_EQUITY_INVEST | TEXT | 是 | NULL | 否 |
| LONG_PREPAID_EXPENSE | TEXT | 是 | NULL | 否 |
| RESEARCH_EXPENSE | TEXT | 是 | NULL | 否 |
| NONBUSINESS_EXPENSE | TEXT | 是 | NULL | 否 |
| OTHER_RECE | TEXT | 是 | NULL | 否 |
| INVEST_REALESTATE | TEXT | 是 | NULL | 否 |
| DEFER_TAX_ASSET | TEXT | 是 | NULL | 否 |
| INVENTORY | TEXT | 是 | NULL | 否 |
| FIXED_ASSET | TEXT | 是 | NULL | 否 |
| AVAILABLE_SALE_FINASSET | TEXT | 是 | NULL | 否 |
| CIP | TEXT | 是 | NULL | 否 |
| HOLD_MATURITY_INVEST | TEXT | 是 | NULL | 否 |

#### 索引
- **sqlite_autoindex_eastmoney_dupont_analysis_1** (唯一)
  列: SECUCODE, REPORT_DATE

---

### 表: `eastmoney_eps_predict`

```sql
CREATE TABLE "eastmoney_eps_predict" (
                "SECUCODE" TEXT, "SECURITY_NAME_ABBR" TEXT, "YEAR" TEXT, "YEAR_MARK" TEXT, "EPS" TEXT, "PE" TEXT, PRIMARY KEY ("SECUCODE", "YEAR")
            )
```

#### 列结构
| 列名 | 类型 | 是否可为空 | 默认值 | 主键 |
|------|------|------------|--------|------|
| SECUCODE | TEXT | 是 | NULL | 是 |
| SECURITY_NAME_ABBR | TEXT | 是 | NULL | 否 |
| YEAR | TEXT | 是 | NULL | 是 |
| YEAR_MARK | TEXT | 是 | NULL | 否 |
| EPS | TEXT | 是 | NULL | 否 |
| PE | TEXT | 是 | NULL | 否 |

#### 索引
- **sqlite_autoindex_eastmoney_eps_predict_1** (唯一)
  列: SECUCODE, YEAR

---

### 表: `eastmoney_income_statement`

```sql
CREATE TABLE "eastmoney_income_statement" (
                "SECUCODE" TEXT, "SECURITY_NAME_ABBR" TEXT, "REPORT_DATE" TEXT, "REPORT_TYPE" TEXT, "REPORT_DATE_NAME" TEXT, "NOTICE_DATE" TEXT, "UPDATE_DATE" TEXT, "TOTAL_OPERATE_INCOME" TEXT, "OPERATE_INCOME" TEXT, "INTEREST_INCOME" TEXT, "TOTAL_OPERATE_COST" TEXT, "OPERATE_COST" TEXT, "INTEREST_EXPENSE" TEXT, "FEE_COMMISSION_EXPENSE" TEXT, "RESEARCH_EXPENSE" TEXT, "OPERATE_TAX_ADD" TEXT, "SALE_EXPENSE" TEXT, "MANAGE_EXPENSE" TEXT, "FINANCE_EXPENSE" TEXT, "FE_INTEREST_EXPENSE" TEXT, "FE_INTEREST_INCOME" TEXT, "FAIRVALUE_CHANGE_INCOME" TEXT, "INVEST_INCOME" TEXT, "ASSET_DISPOSAL_INCOME" TEXT, "CREDIT_IMPAIRMENT_LOSS" TEXT, "OTHER_INCOME" TEXT, "OPERATE_PROFIT" TEXT, "NONBUSINESS_INCOME" TEXT, "NONBUSINESS_EXPENSE" TEXT, "TOTAL_PROFIT" TEXT, "INCOME_TAX" TEXT, "NETPROFIT" TEXT, "CONTINUED_NETPROFIT" TEXT, "PARENT_NETPROFIT" TEXT, "MINORITY_INTEREST" TEXT, "DEDUCT_PARENT_NETPROFIT" TEXT, "BASIC_EPS" TEXT, "DILUTED_EPS" TEXT, "OTHER_COMPRE_INCOME" TEXT, "PARENT_OCI" TEXT, "MINORITY_OCI" TEXT, "TOTAL_COMPRE_INCOME" TEXT, "PARENT_TCI" TEXT, "MINORITY_TCI" TEXT, "OPINION_TYPE" TEXT, "SECURITY_CODE" TEXT, "CURRENCY" TEXT, PRIMARY KEY ("SECUCODE", "REPORT_DATE")
            )
```

#### 列结构
| 列名 | 类型 | 是否可为空 | 默认值 | 主键 |
|------|------|------------|--------|------|
| SECUCODE | TEXT | 是 | NULL | 是 |
| SECURITY_NAME_ABBR | TEXT | 是 | NULL | 否 |
| REPORT_DATE | TEXT | 是 | NULL | 是 |
| REPORT_TYPE | TEXT | 是 | NULL | 否 |
| REPORT_DATE_NAME | TEXT | 是 | NULL | 否 |
| NOTICE_DATE | TEXT | 是 | NULL | 否 |
| UPDATE_DATE | TEXT | 是 | NULL | 否 |
| TOTAL_OPERATE_INCOME | TEXT | 是 | NULL | 否 |
| OPERATE_INCOME | TEXT | 是 | NULL | 否 |
| INTEREST_INCOME | TEXT | 是 | NULL | 否 |
| TOTAL_OPERATE_COST | TEXT | 是 | NULL | 否 |
| OPERATE_COST | TEXT | 是 | NULL | 否 |
| INTEREST_EXPENSE | TEXT | 是 | NULL | 否 |
| FEE_COMMISSION_EXPENSE | TEXT | 是 | NULL | 否 |
| RESEARCH_EXPENSE | TEXT | 是 | NULL | 否 |
| OPERATE_TAX_ADD | TEXT | 是 | NULL | 否 |
| SALE_EXPENSE | TEXT | 是 | NULL | 否 |
| MANAGE_EXPENSE | TEXT | 是 | NULL | 否 |
| FINANCE_EXPENSE | TEXT | 是 | NULL | 否 |
| FE_INTEREST_EXPENSE | TEXT | 是 | NULL | 否 |
| FE_INTEREST_INCOME | TEXT | 是 | NULL | 否 |
| FAIRVALUE_CHANGE_INCOME | TEXT | 是 | NULL | 否 |
| INVEST_INCOME | TEXT | 是 | NULL | 否 |
| ASSET_DISPOSAL_INCOME | TEXT | 是 | NULL | 否 |
| CREDIT_IMPAIRMENT_LOSS | TEXT | 是 | NULL | 否 |
| OTHER_INCOME | TEXT | 是 | NULL | 否 |
| OPERATE_PROFIT | TEXT | 是 | NULL | 否 |
| NONBUSINESS_INCOME | TEXT | 是 | NULL | 否 |
| NONBUSINESS_EXPENSE | TEXT | 是 | NULL | 否 |
| TOTAL_PROFIT | TEXT | 是 | NULL | 否 |
| INCOME_TAX | TEXT | 是 | NULL | 否 |
| NETPROFIT | TEXT | 是 | NULL | 否 |
| CONTINUED_NETPROFIT | TEXT | 是 | NULL | 否 |
| PARENT_NETPROFIT | TEXT | 是 | NULL | 否 |
| MINORITY_INTEREST | TEXT | 是 | NULL | 否 |
| DEDUCT_PARENT_NETPROFIT | TEXT | 是 | NULL | 否 |
| BASIC_EPS | TEXT | 是 | NULL | 否 |
| DILUTED_EPS | TEXT | 是 | NULL | 否 |
| OTHER_COMPRE_INCOME | TEXT | 是 | NULL | 否 |
| PARENT_OCI | TEXT | 是 | NULL | 否 |
| MINORITY_OCI | TEXT | 是 | NULL | 否 |
| TOTAL_COMPRE_INCOME | TEXT | 是 | NULL | 否 |
| PARENT_TCI | TEXT | 是 | NULL | 否 |
| MINORITY_TCI | TEXT | 是 | NULL | 否 |
| OPINION_TYPE | TEXT | 是 | NULL | 否 |
| SECURITY_CODE | TEXT | 是 | NULL | 否 |
| CURRENCY | TEXT | 是 | NULL | 否 |

#### 索引
- **sqlite_autoindex_eastmoney_income_statement_1** (唯一)
  列: SECUCODE, REPORT_DATE

---

### 表: `eastmoney_main_financial`

```sql
CREATE TABLE "eastmoney_main_financial" (
                "SECUCODE" TEXT, "SECURITY_NAME_ABBR" TEXT, "REPORT_DATE" TEXT, "REPORT_TYPE" TEXT, "REPORT_DATE_NAME" TEXT, "NOTICE_DATE" TEXT, "UPDATE_DATE" TEXT, "EPSJB" TEXT, "EPSKCJB" TEXT, "EPSXS" TEXT, "BPS" TEXT, "MGZBGJ" TEXT, "MGWFPLR" TEXT, "MGJYXJJE" TEXT, "TOTALOPERATEREVE" TEXT, "MLR" TEXT, "PARENTNETPROFIT" TEXT, "KCFJCXSYJLR" TEXT, "TOTALOPERATEREVETZ" TEXT, "PARENTNETPROFITTZ" TEXT, "KCFJCXSYJLRTZ" TEXT, "YYZSRGDHBZC" TEXT, "NETPROFITRPHBZC" TEXT, "KFJLRGDHBZC" TEXT, "ROEJQ" TEXT, "ROEKCJQ" TEXT, "ZZCJLL" TEXT, "XSJLL" TEXT, "XSMLL" TEXT, "XSJXLYYSR" TEXT, "JYXJLYYSR" TEXT, "TAXRATE" TEXT, "LD" TEXT, "SD" TEXT, "XJLLB" TEXT, "ZCFZL" TEXT, "QYCS" TEXT, "CQBL" TEXT, "ZZCZZTS" TEXT, "CHZZTS" TEXT, "YSZKZZTS" TEXT, "TOAZZL" TEXT, "CHZZL" TEXT, "YSZKZZL" TEXT, PRIMARY KEY ("SECUCODE", "REPORT_DATE")
            )
```

#### 列结构
| 列名 | 类型 | 是否可为空 | 默认值 | 主键 |
|------|------|------------|--------|------|
| SECUCODE | TEXT | 是 | NULL | 是 |
| SECURITY_NAME_ABBR | TEXT | 是 | NULL | 否 |
| REPORT_DATE | TEXT | 是 | NULL | 是 |
| REPORT_TYPE | TEXT | 是 | NULL | 否 |
| REPORT_DATE_NAME | TEXT | 是 | NULL | 否 |
| NOTICE_DATE | TEXT | 是 | NULL | 否 |
| UPDATE_DATE | TEXT | 是 | NULL | 否 |
| EPSJB | TEXT | 是 | NULL | 否 |
| EPSKCJB | TEXT | 是 | NULL | 否 |
| EPSXS | TEXT | 是 | NULL | 否 |
| BPS | TEXT | 是 | NULL | 否 |
| MGZBGJ | TEXT | 是 | NULL | 否 |
| MGWFPLR | TEXT | 是 | NULL | 否 |
| MGJYXJJE | TEXT | 是 | NULL | 否 |
| TOTALOPERATEREVE | TEXT | 是 | NULL | 否 |
| MLR | TEXT | 是 | NULL | 否 |
| PARENTNETPROFIT | TEXT | 是 | NULL | 否 |
| KCFJCXSYJLR | TEXT | 是 | NULL | 否 |
| TOTALOPERATEREVETZ | TEXT | 是 | NULL | 否 |
| PARENTNETPROFITTZ | TEXT | 是 | NULL | 否 |
| KCFJCXSYJLRTZ | TEXT | 是 | NULL | 否 |
| YYZSRGDHBZC | TEXT | 是 | NULL | 否 |
| NETPROFITRPHBZC | TEXT | 是 | NULL | 否 |
| KFJLRGDHBZC | TEXT | 是 | NULL | 否 |
| ROEJQ | TEXT | 是 | NULL | 否 |
| ROEKCJQ | TEXT | 是 | NULL | 否 |
| ZZCJLL | TEXT | 是 | NULL | 否 |
| XSJLL | TEXT | 是 | NULL | 否 |
| XSMLL | TEXT | 是 | NULL | 否 |
| XSJXLYYSR | TEXT | 是 | NULL | 否 |
| JYXJLYYSR | TEXT | 是 | NULL | 否 |
| TAXRATE | TEXT | 是 | NULL | 否 |
| LD | TEXT | 是 | NULL | 否 |
| SD | TEXT | 是 | NULL | 否 |
| XJLLB | TEXT | 是 | NULL | 否 |
| ZCFZL | TEXT | 是 | NULL | 否 |
| QYCS | TEXT | 是 | NULL | 否 |
| CQBL | TEXT | 是 | NULL | 否 |
| ZZCZZTS | TEXT | 是 | NULL | 否 |
| CHZZTS | TEXT | 是 | NULL | 否 |
| YSZKZZTS | TEXT | 是 | NULL | 否 |
| TOAZZL | TEXT | 是 | NULL | 否 |
| CHZZL | TEXT | 是 | NULL | 否 |
| YSZKZZL | TEXT | 是 | NULL | 否 |

#### 索引
- **sqlite_autoindex_eastmoney_main_financial_1** (唯一)
  列: SECUCODE, REPORT_DATE

---

### 表: `eastmoney_org_eps_predict`

```sql
CREATE TABLE "eastmoney_org_eps_predict" (
                "SECUCODE" TEXT, "SECURITY_NAME_ABBR" TEXT, "ORG_NAME_ABBR" TEXT, "YEAR1" TEXT, "YEAR_MARK1" TEXT, "EPS1" TEXT, "PE1" TEXT, "YEAR2" TEXT, "YEAR_MARK2" TEXT, "EPS2" TEXT, "PE2" TEXT, "YEAR3" TEXT, "YEAR_MARK3" TEXT, "EPS3" TEXT, "PE3" TEXT, "YEAR4" TEXT, "YEAR_MARK4" TEXT, "EPS4" TEXT, "PE4" TEXT, PRIMARY KEY ("SECUCODE", "ORG_NAME_ABBR")
            )
```

#### 列结构
| 列名 | 类型 | 是否可为空 | 默认值 | 主键 |
|------|------|------------|--------|------|
| SECUCODE | TEXT | 是 | NULL | 是 |
| SECURITY_NAME_ABBR | TEXT | 是 | NULL | 否 |
| ORG_NAME_ABBR | TEXT | 是 | NULL | 是 |
| YEAR1 | TEXT | 是 | NULL | 否 |
| YEAR_MARK1 | TEXT | 是 | NULL | 否 |
| EPS1 | TEXT | 是 | NULL | 否 |
| PE1 | TEXT | 是 | NULL | 否 |
| YEAR2 | TEXT | 是 | NULL | 否 |
| YEAR_MARK2 | TEXT | 是 | NULL | 否 |
| EPS2 | TEXT | 是 | NULL | 否 |
| PE2 | TEXT | 是 | NULL | 否 |
| YEAR3 | TEXT | 是 | NULL | 否 |
| YEAR_MARK3 | TEXT | 是 | NULL | 否 |
| EPS3 | TEXT | 是 | NULL | 否 |
| PE3 | TEXT | 是 | NULL | 否 |
| YEAR4 | TEXT | 是 | NULL | 否 |
| YEAR_MARK4 | TEXT | 是 | NULL | 否 |
| EPS4 | TEXT | 是 | NULL | 否 |
| PE4 | TEXT | 是 | NULL | 否 |

#### 索引
- **sqlite_autoindex_eastmoney_org_eps_predict_1** (唯一)
  列: SECUCODE, ORG_NAME_ABBR

---

### 表: `equity_bond_spread`

```sql
CREATE TABLE equity_bond_spread (
            date TEXT NOT NULL,                    -- 日期
            code TEXT NOT NULL,                    -- 指数代码（沪深300）
            close REAL,                            -- 指数收盘价
            peSpread REAL,                         -- 股债利差（基于市盈率计算的股权风险溢价）
            dvSpread REAL,                         -- 股息率利差（基于过去一年股息率）
            dvTtmSpread REAL,                      -- 股息率利差（基于滚动12个月股息率）
            dvSpreadAverage REAL,                  -- 股息率利差（一年股息率）的历史均值
            dvTtmSpreadAverage REAL,               -- 股息率利差（滚动12个月股息率）的历史均值
            peSpreadAverage REAL,                  -- 股债利差的历史均线
            dvSpreadStandardDeviation REAL,        -- 股息率利差（一年股息率）的标准差
            dvTtmSpreadStandardDeviation REAL,     -- 股息率利差（滚动12个月股息率）的标准差
            peSpreadStandardDeviation REAL,        -- 股债利差的标准差
            PRIMARY KEY (date, code)
        )
```

#### 列结构
| 列名 | 类型 | 是否可为空 | 默认值 | 主键 |
|------|------|------------|--------|------|
| date | TEXT | 否 | NULL | 是 |
| code | TEXT | 否 | NULL | 是 |
| close | REAL | 是 | NULL | 否 |
| peSpread | REAL | 是 | NULL | 否 |
| dvSpread | REAL | 是 | NULL | 否 |
| dvTtmSpread | REAL | 是 | NULL | 否 |
| dvSpreadAverage | REAL | 是 | NULL | 否 |
| dvTtmSpreadAverage | REAL | 是 | NULL | 否 |
| peSpreadAverage | REAL | 是 | NULL | 否 |
| dvSpreadStandardDeviation | REAL | 是 | NULL | 否 |
| dvTtmSpreadStandardDeviation | REAL | 是 | NULL | 否 |
| peSpreadStandardDeviation | REAL | 是 | NULL | 否 |

#### 索引
- **sqlite_autoindex_equity_bond_spread_1** (唯一)
  列: date, code

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
- **idx_stock_day_pepb_data_date** (非唯一)
  列: date
- **idx_stock_day_pepb_data_codeName** (非唯一)
  列: codeName
- **idx_stock_day_pepb_data_code** (非唯一)
  列: code
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

### 表: `stockinfo`

```sql
CREATE TABLE stockinfo (
    code TEXT NOT NULL,
    codeName TEXT,
    update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (code, codeName)
)
```

#### 列结构
| 列名 | 类型 | 是否可为空 | 默认值 | 主键 |
|------|------|------------|--------|------|
| code | TEXT | 否 | NULL | 是 |
| codeName | TEXT | 是 | NULL | 是 |
| update_time | TIMESTAMP | 是 | CURRENT_TIMESTAMP | 否 |

#### 索引
- **idx_stockinfo_codename_code** (非唯一)
  列: codeName, code
- **sqlite_autoindex_stockinfo_1** (唯一)
  列: code, codeName

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

## 独立索引
共 4 个独立索引

### 索引: `idx_stock_day_pepb_data_code`
```sql
CREATE INDEX idx_stock_day_pepb_data_code
        ON stock_day_pepb_data(code)
```

### 索引: `idx_stock_day_pepb_data_codeName`
```sql
CREATE INDEX idx_stock_day_pepb_data_codeName
        ON stock_day_pepb_data(codeName)
```

### 索引: `idx_stock_day_pepb_data_date`
```sql
CREATE INDEX idx_stock_day_pepb_data_date
        ON stock_day_pepb_data(date)
```

### 索引: `idx_stockinfo_codename_code`
```sql
CREATE INDEX idx_stockinfo_codename_code ON stockinfo (codeName, code)
```
