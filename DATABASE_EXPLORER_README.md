# Database Explorer

A comprehensive database exploration tool that supports MongoDB, PostgreSQL, MySQL, and SQLite databases. This tool provides a modern, intuitive interface for database administrators and developers to connect to, explore, and analyze their databases.

## Features

### 🔌 Multi-Database Support
- **MongoDB**: Native support for collections, documents, and MongoDB query syntax
- **PostgreSQL**: Full SQL support with schema introspection
- **MySQL**: Complete MySQL compatibility
- **SQLite**: Lightweight database support

### 🚀 Core Functionality
- **Connection Management**: Create, save, and manage multiple database connections
- **Database Exploration**: Browse tables, collections, views, and their contents
- **Query Execution**: Run custom queries with syntax highlighting
- **Schema Inspection**: Detailed view of database structure, indexes, and constraints
- **Data Visualization**: Multiple chart types and export options

### 🎯 Key Components

#### 1. Connection Manager
- Secure connection storage
- Connection status monitoring
- Support for connection strings and individual parameters
- Authentication for SQL databases

#### 2. Database Explorer
- Tree-view navigation of database objects
- Object metadata (size, record count, last modified)
- Quick data preview
- Object type identification

#### 3. Query Builder
- Visual query construction
- Drag-and-drop field selection
- Condition builder with logical operators
- Support for both SQL and MongoDB syntax
- Query templates and examples

#### 4. Schema Inspector
- Detailed field information
- Index and constraint details
- Relationship visualization
- Schema export capabilities

#### 5. Data Visualizer
- Multiple chart types (Bar, Pie, Line, Table)
- Interactive data filtering
- Sorting and search capabilities
- Data export (CSV, JSON)

## Getting Started

### 1. Access the Explorer
Navigate to the Database module in your dashboard and click on "Database Explorer" or go directly to `/database/explorer`.

### 2. Create a Connection
1. Click "New Connection" button
2. Fill in connection details:
   - **Connection Name**: A friendly name for your connection
   - **Database Type**: Select from MongoDB, PostgreSQL, MySQL, or SQLite
   - **Host**: Database server address
   - **Port**: Database port number
   - **Database**: Database name
   - **Username/Password**: For SQL databases (optional for MongoDB)

### 3. Connect and Explore
1. Click "Connect" on your connection
2. Browse database objects in the Explorer tab
3. Click on objects to view their data
4. Use the Query tab to execute custom queries
5. Explore schema details in the Schema tab
6. Visualize data in the Visualize tab

## Usage Examples

### MongoDB Query Examples
```javascript
// Find all users
db.users.find({})

// Find users with specific criteria
db.users.find({ status: "active", age: { $gte: 18 } })

// Project specific fields
db.users.find({}).project({ username: 1, email: 1, _id: 0 })

// Sort and limit
db.users.find({}).sort({ created_at: -1 }).limit(10)
```

### SQL Query Examples
```sql
-- Basic select
SELECT * FROM users LIMIT 10

-- With conditions
SELECT username, email FROM users WHERE status = 'active' AND created_at > '2024-01-01'

-- Joins
SELECT u.username, o.total_amount 
FROM users u 
JOIN orders o ON u.id = o.user_id 
WHERE o.status = 'completed'

-- Aggregations
SELECT status, COUNT(*) as count 
FROM orders 
GROUP BY status 
ORDER BY count DESC
```

## Advanced Features

### Query Builder
The visual query builder helps construct complex queries:
1. Select fields to include
2. Add filtering conditions
3. Set sorting order
4. Apply limits
5. Generate the final query

### Schema Analysis
- View table structures
- Analyze indexes and their performance impact
- Understand relationships between tables
- Export schema documentation

### Data Visualization
- **Bar Charts**: Compare values across categories
- **Pie Charts**: Show proportions and percentages
- **Line Charts**: Track trends over time
- **Data Tables**: Sort, filter, and search results

### Export Options
- **CSV**: For spreadsheet applications
- **JSON**: For API integrations
- **Schema Documentation**: For team collaboration

## Security Features

- **Connection Encryption**: Secure connections to databases
- **Password Protection**: Secure storage of credentials
- **Access Control**: Role-based permissions
- **Audit Logging**: Track database operations

## Performance Tips

1. **Use Indexes**: Ensure proper indexing for frequently queried fields
2. **Limit Results**: Use LIMIT clauses to avoid large result sets
3. **Optimize Queries**: Use the query builder to create efficient queries
4. **Monitor Performance**: Check execution times for slow queries

## Troubleshooting

### Connection Issues
- Verify network connectivity
- Check firewall settings
- Ensure correct port numbers
- Verify database credentials

### Query Errors
- Check syntax for your database type
- Verify table/collection names
- Ensure field names are correct
- Check data types match

### Performance Issues
- Review query execution plans
- Check database server resources
- Optimize slow queries
- Consider adding indexes

## Browser Compatibility

- **Chrome**: 90+
- **Firefox**: 88+
- **Safari**: 14+
- **Edge**: 90+

## Technical Requirements

- **Node.js**: 18.0.0+
- **React**: 18.0.0+
- **TypeScript**: 4.9.0+
- **Tailwind CSS**: 3.0.0+

## Contributing

To contribute to the Database Explorer:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Support

For support and questions:
- Check the documentation
- Review existing issues
- Create a new issue with detailed information
- Contact the development team

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Note**: This is a demonstration version with mock data. In production, it would connect to real databases and include additional security measures.