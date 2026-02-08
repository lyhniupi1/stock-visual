#!/usr/bin/env python3
"""
提取SQLite数据库元数据并生成Markdown报告
"""

import sqlite3
import sys
from pathlib import Path
from datetime import datetime

def get_db_metadata(db_path):
    """获取数据库的完整元数据"""
    if not Path(db_path).exists():
        raise FileNotFoundError(f"数据库文件不存在: {db_path}")
    
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    metadata = {
        "database_info": {},
        "tables": [],
        "indexes": [],
        "views": [],
        "triggers": [],
        "foreign_keys": []
    }
    
    # 1. 数据库基本信息
    cursor.execute("SELECT sqlite_version() as version")
    metadata["database_info"]["sqlite_version"] = cursor.fetchone()[0]
    
    cursor.execute("PRAGMA database_list")
    metadata["database_info"]["database_list"] = cursor.fetchall()
    
    cursor.execute("PRAGMA page_size")
    metadata["database_info"]["page_size"] = cursor.fetchone()[0]
    
    cursor.execute("PRAGMA page_count")
    metadata["database_info"]["page_count"] = cursor.fetchone()[0]
    
    cursor.execute("PRAGMA encoding")
    metadata["database_info"]["encoding"] = cursor.fetchone()[0]
    
    # 2. 获取所有表
    cursor.execute("SELECT name, sql FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name")
    tables = cursor.fetchall()
    
    for table_name, table_sql in tables:
        table_info = {
            "name": table_name,
            "sql": table_sql,
            "columns": [],
            "indexes": [],
            "foreign_keys": []
        }
        
        # 获取列信息
        cursor.execute(f"PRAGMA table_info('{table_name}')")
        columns = cursor.fetchall()
        for col in columns:
            table_info["columns"].append(dict(col))
        
        # 获取索引信息
        cursor.execute(f"PRAGMA index_list('{table_name}')")
        indexes = cursor.fetchall()
        for idx in indexes:
            idx_name = idx[1]
            cursor.execute(f"PRAGMA index_info('{idx_name}')")
            idx_info = cursor.fetchall()
            table_info["indexes"].append({
                "name": idx_name,
                "unique": idx[2],
                "origin": idx[3],
                "partial": idx[4],
                "columns": idx_info
            })
        
        # 获取外键信息
        cursor.execute(f"PRAGMA foreign_key_list('{table_name}')")
        fks = cursor.fetchall()
        for fk in fks:
            table_info["foreign_keys"].append(dict(zip(
                ['id', 'seq', 'table', 'from', 'to', 'on_update', 'on_delete', 'match'],
                fk
            )))
        
        metadata["tables"].append(table_info)
    
    # 3. 获取所有视图
    cursor.execute("SELECT name, sql FROM sqlite_master WHERE type='view' ORDER BY name")
    views = cursor.fetchall()
    for view_name, view_sql in views:
        metadata["views"].append({
            "name": view_name,
            "sql": view_sql
        })
    
    # 4. 获取所有触发器
    cursor.execute("SELECT name, sql FROM sqlite_master WHERE type='trigger' ORDER BY name")
    triggers = cursor.fetchall()
    for trigger_name, trigger_sql in triggers:
        metadata["triggers"].append({
            "name": trigger_name,
            "sql": trigger_sql
        })
    
    # 5. 获取所有索引（独立索引）
    cursor.execute("SELECT name, sql FROM sqlite_master WHERE type='index' AND name NOT LIKE 'sqlite_%' ORDER BY name")
    indexes = cursor.fetchall()
    for index_name, index_sql in indexes:
        metadata["indexes"].append({
            "name": index_name,
            "sql": index_sql
        })
    
    conn.close()
    return metadata

def format_metadata_markdown(metadata):
    """将元数据格式化为Markdown"""
    md_lines = []
    
    # 标题
    md_lines.append("# SQLite 数据库元数据报告")
    md_lines.append(f"生成时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    md_lines.append("")
    
    # 数据库信息
    md_lines.append("## 数据库基本信息")
    md_lines.append(f"- SQLite 版本: {metadata['database_info']['sqlite_version']}")
    md_lines.append(f"- 页面大小: {metadata['database_info']['page_size']} 字节")
    md_lines.append(f"- 页面数量: {metadata['database_info']['page_count']}")
    md_lines.append(f"- 总大小: {metadata['database_info']['page_size'] * metadata['database_info']['page_count']:,} 字节")
    md_lines.append(f"- 编码: {metadata['database_info']['encoding']}")
    md_lines.append("")
    
    # 表信息
    md_lines.append("## 数据表")
    md_lines.append(f"共 {len(metadata['tables'])} 个表")
    md_lines.append("")
    
    for table in metadata['tables']:
        md_lines.append(f"### 表: `{table['name']}`")
        md_lines.append("")
        
        # 表定义
        if table['sql']:
            md_lines.append("```sql")
            md_lines.append(table['sql'])
            md_lines.append("```")
            md_lines.append("")
        
        # 列信息
        md_lines.append("#### 列结构")
        md_lines.append("| 列名 | 类型 | 是否可为空 | 默认值 | 主键 |")
        md_lines.append("|------|------|------------|--------|------|")
        for col in table['columns']:
            nullable = "是" if col['notnull'] == 0 else "否"
            pk = "是" if col['pk'] > 0 else "否"
            default = col['dflt_value'] if col['dflt_value'] is not None else "NULL"
            md_lines.append(f"| {col['name']} | {col['type']} | {nullable} | {default} | {pk} |")
        md_lines.append("")
        
        # 索引
        if table['indexes']:
            md_lines.append("#### 索引")
            for idx in table['indexes']:
                unique = "唯一" if idx['unique'] else "非唯一"
                md_lines.append(f"- **{idx['name']}** ({unique})")
                if idx['columns']:
                    cols = ", ".join([col[2] for col in idx['columns']])
                    md_lines.append(f"  列: {cols}")
            md_lines.append("")
        
        # 外键
        if table['foreign_keys']:
            md_lines.append("#### 外键约束")
            for fk in table['foreign_keys']:
                md_lines.append(f"- `{fk['from']}` → `{fk['table']}.{fk['to']}`")
                if fk['on_update'] != 'NO ACTION':
                    md_lines.append(f"  ON UPDATE: {fk['on_update']}")
                if fk['on_delete'] != 'NO ACTION':
                    md_lines.append(f"  ON DELETE: {fk['on_delete']}")
            md_lines.append("")
        
        md_lines.append("---")
        md_lines.append("")
    
    # 视图
    if metadata['views']:
        md_lines.append("## 视图")
        md_lines.append(f"共 {len(metadata['views'])} 个视图")
        md_lines.append("")
        for view in metadata['views']:
            md_lines.append(f"### 视图: `{view['name']}`")
            md_lines.append("```sql")
            md_lines.append(view['sql'])
            md_lines.append("```")
            md_lines.append("")
    
    # 触发器
    if metadata['triggers']:
        md_lines.append("## 触发器")
        md_lines.append(f"共 {len(metadata['triggers'])} 个触发器")
        md_lines.append("")
        for trigger in metadata['triggers']:
            md_lines.append(f"### 触发器: `{trigger['name']}`")
            md_lines.append("```sql")
            md_lines.append(trigger['sql'])
            md_lines.append("```")
            md_lines.append("")
    
    # 独立索引
    if metadata['indexes']:
        md_lines.append("## 独立索引")
        md_lines.append(f"共 {len(metadata['indexes'])} 个独立索引")
        md_lines.append("")
        for idx in metadata['indexes']:
            md_lines.append(f"### 索引: `{idx['name']}`")
            if idx.get('sql'):
                md_lines.append("```sql")
                md_lines.append(idx['sql'])
                md_lines.append("```")
            md_lines.append("")
    
    return "\n".join(md_lines)

def main():
    db_path = "data/stocks.db"
    output_path = "db.md"
    
    print(f"正在分析数据库: {db_path}")
    
    try:
        metadata = get_db_metadata(db_path)
        print(f"数据库分析完成，共发现 {len(metadata['tables'])} 个表")
        
        markdown_content = format_metadata_markdown(metadata)
        
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(markdown_content)
        
        print(f"元数据已导出到: {output_path}")
        
        # 打印摘要
        print("\n数据库摘要:")
        print(f"- 表数量: {len(metadata['tables'])}")
        print(f"- 视图数量: {len(metadata['views'])}")
        print(f"- 触发器数量: {len(metadata['triggers'])}")
        print(f"- 独立索引数量: {len(metadata['indexes'])}")
        
        return 0
        
    except Exception as e:
        print(f"错误: {e}")
        return 1

if __name__ == "__main__":
    sys.exit(main())