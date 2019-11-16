# Rowjam Overview

**Rowjam** is a javascript library which makes it easier to process data from a database. It works on **table arrays**, which are arrays formatted as below. Rowjam does not make any assumptions about and does not care how you obtain the data, it simply helps processing it.

To see how to use rowjam in a project, clone this repo and look at browser_example or node_example.

### Format for a table array

For the sake of this discussion, we call tableA a **table array**, each element of the array a **row**, each key in a row a **column**, and each value of a column a **value**. So tableA has 3 rows. Each row has 5 columns. The primary key of the table is the 'MEETING_ID' column.

```javascript
var tableA = [
  {
    MEETING_ID: "16540576",
    EXPENSE_AMOUNT: "1000.00",
    ESTIMATE_AMOUNT: "800.00",
    START_DATE: "2015-04-13 08:00:00.000",
    CATEGORY: "conference"
  },
  {
    MEETING_ID: "16540577",
    EXPENSE_AMOUNT: "1030.00",
    ESTIMATE_AMOUNT: "810.00",
    START_DATE: "2015-04-13 08:00:00.000",
    CATEGORY: "visit"
  },
  {
    MEETING_ID: "16540578",
    EXPENSE_AMOUNT: "1000.00",
    ESTIMATE_AMOUNT: "700.00",
    START_DATE: "2015-04-17 08:00:00.000",
    CATEGORY: "conference"
  }
];
```

### Methods for individual table arrays

- **filter** Reduce a table array by searching for columns that match a given condition (column _'operator'_ value). Available operators are: ===, <, >, <=, >==, empty, notempty, starts, contains.

- **summarize** Reduce a table array to a summary object by adding up specified number fields, and concatenating specified string fields.

- **toLookup** Pick a column to act as a grouping key, and create an object where each unique value of that column is a key, and that key's value is an array of rows that match. (For example, if you create a lookup by category, then lookup[cat1] is an array of rows whose category is cat1.)

- **setTypes** Cast specified columns to make sure they are the right javascript type for subsequent operations.

- **values** Returns an array of unique values from the given column across the given table array.

### Methods for merging a table array into another

- **joinAsArray** Goes through each row of the source table, attaching an array of matching rows from the join table. It matches between two given columns.

- **joinSummary** Goes through each row of the source table, attaching a summary of the join table as a key-value object. It matches between two given keys and summarizes using the **summarize** method.

## Using Rowjam

**Rowjam** is set up to use "chaining" to accomplish its work.

To demonstrate, let's finds the summary of expenses and estimates for March 13, 2015 from the above table array.

```javascript
var summary = rowjam(tableA)
  .setTypes({
    MEETING_ID: "string",
    ESTIMATE_AMOUNT: "number",
    EXPENSE_AMOUNT: "number",
    START_DATE: "string"
  })
  .filter("START_DATE", "starts", "2015-04-13")
  .summarize(["ESTIMATE_AMOUNT", "EXPENSE_AMOUNT"]);

console.log(JSON.stringify(summary, null, 2));
```

This prints the **summary** object...

```
{
  "ESTIMATE_AMOUNT": 1610,
  "EXPENSE_AMOUNT": 2030
}
```

### Walkthru

    rowjam(tableA)

The above creates a wrapper object and copies the array into it. If you don't want to make a copy (to save memory or time) you can use `rowjam(tableA, false)`.

Now that you have a rowjam wrapper object, you can call its methods.

    .setTypes({'MEETING_ID':'string', 'ESTIMATE_AMOUNT' : 'number', 'EXPENSE_AMOUNT' :'number', 'START_DATE':'string'})

...iterates through each row and sets the type of each of the given columns by casting the value. Columns that are unspecified remain untouched.

    .filter('START_DATE', 'starts', '2015-04-13')

...keeps only the rows whose START_DATE has the string prefix '2015-04-17'. Treating a date as a string is a hack, but it's effective and easy.

    .summarize(['ESTIMATE_AMOUNT', 'EXPENSE_AMOUNT'])

... Adds up values for ESTIMATE_AMOUNT and EXPENSE_AMOUNT from all the rows left in the chain. Returns the summary object and ends the chain.

### The _value_ object

The chainable methods work by saving their output in the wrapper's **.value** object. For example, to get the array after a filter operation, grab the value. Like this:

```
  var filteredArray = rowjam(tableA).filter('START_DATE', 'starts', '2015-04-13').value;
  console.log(JSON.stringify(filteredArray, null, 2));

> [
    {
      "MEETING_ID": "16540576",
      "EXPENSE_AMOUNT": 1000,
      "ESTIMATE_AMOUNT": 800,
      "START_DATE": "2015-04-13 08:00:00.000",
      "CATEGORY": "conference"
    },
    {
      "MEETING_ID": "16540577",
      "EXPENSE_AMOUNT": 1030,
      "ESTIMATE_AMOUNT": 810,
      "START_DATE": "2015-04-13 08:00:00.000",
      "CATEGORY": "visit"
    }
  ]
```

## Method Reference

### rowjam(table, makeCopy = true)

This is the constructor function for the chain. Starts a chain.

**table** A table array to work on.

**makeCopy** if true, copies the input array so the original is untouched. If _makeCopy_ is false, processes the original array.

Chainable: Yes. Access the value object of the chain for the raw array.

<hr>
### filter(column, operator, value, caseSensitive = true)
This returns a new array in which all the rows match the operation **(column *'operator'* value)**. Operators will act on columns without casting, so types have to be correct before using this.

Chainable: Yes. Access the value object of the chain for the raw array.

**column**: the name of a key in the row object

**operator** a string that contains the operator to use in the filter.

    "="         equals using '===' operator
    "=="        equals using '===' operator
    "==="       equals using '===' operator
    "<"         less than
    "<="        less than or equal to
    ">"         greater than
    ">="        greater than or equal to
    "empty"     matches undefined, [], "", and null. value and caseSensitive are ignored.
    "notempty"  matches any value that's not empty. value and caseSensitive are ignored.
    "starts"    matches any string value that starts with the string value param.
    "contains"  matches any string value that contains the string value param.

**value** the right-hand value for the filter operation.

**caseSensitive** If false, compares all values without case sensitivity. Tries to check if values are strings before processing.

<hr>
### summarize(colsToSum = [], colsToConcat = [], delim = "\n", rowCountColumn = "")
Chainable: No.

Iterates through the table array, adding up each column in colsToSum and concatenating each column in colsToConcat using delimiter delim. If rowCountColumn is given, creates a new column key of that name and gives it the length of the array as a value. Returns an object whose keys are from colsToSum and colsToConcat, and has a rowCountColumn if t hat is specified.

**colsToSum** An array of column names to add up. Make sure the values are numeric first (using setTypes.)

**colsToConcat** An array of column names to concat into a string, seperated by delim.

**delim** A string that is used to delimit the concatenated values.

**rowCountColumn** The name of a new column to hold the length of the array. (Useful for calculating averages.)

<hr>
### toLookup(keyColumn)
Chainable: No.

Uses the values in keyColumn to transform the table array into a lookup object of the format:

    {
      "key_value_1": [ {col1: val, col2: val}, {col1: val, col2:val } ],
      "key_value_2": [ {col1: val, col2: val}, {col1: val, col2:val } ]
    }

**keyColumn** The column to use a grouping key.

For Example:

```javascript

  var lookup = rowjam(tableA).toLookup('CATEGORY');
  console.log(JSON.stringify(lookup, null, 2));

> {
    "conference": [
      {
        "MEETING_ID": "16540576",
        "EXPENSE_AMOUNT": "1000.00",
        "ESTIMATE_AMOUNT": "800.00",
        "START_DATE": "2015-04-13 08:00:00.000",
        "CATEGORY": "conference"
      },
      {
        "MEETING_ID": "16540578",
        "EXPENSE_AMOUNT": "1000.00",
        "ESTIMATE_AMOUNT": "700.00",
        "START_DATE": "2015-04-17 08:00:00.000",
        "CATEGORY": "conference"
      }
    ],
    "visit": [
      {
        "MEETING_ID": "16540577",
        "EXPENSE_AMOUNT": "1030.00",
        "ESTIMATE_AMOUNT": "810.00",
        "START_DATE": "2015-04-13 08:00:00.000",
        "CATEGORY": "visit"
      }
    ]
 }
```

<hr>
### setTypes(typeOptions)
Chainable: Yes

Attempts to ensure that the given columns have values of the given javascript types. Unspecified columns are left alone.

**typeOptions** An object of key-value pairs where each key is a column name and each value is a type string.

For example (this is the complete list of supported types):

    {
      column_1 : 'string',
      column_2 : 'number',
      column_3 : 'boolean'
    }

<hr>
### values(column, unique = true)
Chainable: No

Extracts an array of values for the given column. If unique is true, only returns unique values.

For example:

```
    var meetingIdArray = rowjam(tableA).values('MEETING_ID');
    console.log(JSON.stringify(meetingIdArray));

>  ["16540576","16540577","16540578"]

    var uniqueCategories = rowjam(tableA).values('CATEGORY', true);
    console.log(JSON.stringify(uniqueCategories));

>  ["conference","visit"]

    var categoryIndex = rowjam(tableA).values('CATEGORY', false);
    console.log(JSON.stringify(categoryIndex));

>  ["conference","visit","conference"]
```

<hr>
### dump()
Chainable: Yes

Prints out the current array to the console as pretty-printed JSON.

<hr>
### print(data)
Chainable: No

Prints out data to the console as pretty-printed JSON. Just a utility function.

<hr>
### joinAsArray(saveColumn, srcColumn, joinTable, joinColumn)
Chainable: Yes

"Fills out" the source array with pieces of a joined array, where sourceTable.srcColumn = joinTable.joinColumn. The new array is set to a new column named by saveColumn. If there are no joinable rows, the new value is []. This is similar to a join operation in a relation database.

**saveColumn** The name of the new column in the source row to hold the array.

**srcColumn** The name of the column in the source array to join on.

**joinTable** The table array to add to the chain source table array.

**joinColumn** The name of the column in the joinTable to match to srcColumn.

For example, let's make a new tableB that has supplemental information for tableA.

```
var tableB = [
    {
        "MEETING_ID" : "16540576",
        "SPEAKER_FEE": 100.00
    },
    {
        "MEETING_ID" : "16540576",
        "SPEAKER_FEE": 120.00
    },
    {
        "MEETING_ID" : "16540577",
        "SPEAKER_FEE": 130.00
    },
    {
        "MEETING_ID" : "16540578",
        "SPEAKER_FEE": 140.00
    },
    {
        "MEETING_ID" : "16540578",
        "SPEAKER_FEE": 150.00
    },
    {
        "MEETING_ID" : "16540576",
        "SPEAKER_FEE": 160.00
    }
];
```

Now let's join it to tableA.

```
rowjam(tableA).setTypes({'MEETING_ID':'string'}).joinAsArray('fees', 'MEETING_ID', tableB, 'MEETING_ID').dump();

> [
    {
        "MEETING_ID": "16540576",
        "EXPENSE_AMOUNT": "1000.00",
        "ESTIMATE_AMOUNT": "800.00",
        "START_DATE": "2015-04-13 08:00:00.000",
        "CATEGORY": "conference",
        "fees": [
            {
                "MEETING_ID": "16540576",
                "SPEAKER_FEE": 100
            },
            {
                "MEETING_ID": "16540576",
                "SPEAKER_FEE": 120
            },
            {
                "MEETING_ID": "16540576",
                "SPEAKER_FEE": 160
            }
        ]
    },
    {
        "MEETING_ID": "16540577",
        "EXPENSE_AMOUNT": "1030.00",
        "ESTIMATE_AMOUNT": "810.00",
        "START_DATE": "2015-04-13 08:00:00.000",
        "CATEGORY": "visit",
        "fees": [
            {
                "MEETING_ID": "16540577",
                "SPEAKER_FEE": 130
            }
        ]
    },
    {
        "MEETING_ID": "16540578",
        "EXPENSE_AMOUNT": "1000.00",
        "ESTIMATE_AMOUNT": "700.00",
        "START_DATE": "2015-04-17 08:00:00.000",
        "CATEGORY": "conference",
        "fees": [
            {
                "MEETING_ID": "16540578",
                "SPEAKER_FEE": 140
            },
            {
                "MEETING_ID": "16540578",
                "SPEAKER_FEE": 150
            }
        ]
    }
  ]
```

<hr>
### joinAsSummary(saveColumn, srcColumn, joinTable, joinColumn, colsToSum, colsToConcat, delim, rowCountColumn)
Chainable: No

"Fills out" the source array with the **summary** of pieces of a joined array, where sourceTable.srcColumn = joinTable.joinColumn. The new summary is added to a new column named by saveColumn. If saveColumn is "", the summary fields are added directly to the source row.

**saveColumn** The name of the new column in the source row to hold the array.

**srcColumn** The name of the column in the source array to join on.

**joinTable** The table array to add.

**joinColumn** The name of the column in the joinTable to match to srcColumn.

**colsToSum** An array of column names to add up. Make sure the values are numeric before calling (using setTypes.)

**colsToConcat** An array of column names to concat into a string, seperated by delim.

**delim** A string that is used to delimit the concatenated values.

**rowCountColumn** The name of a new column to hold the length of the array. (Useful for calculating averages.)

For example, let's join and summarize tableB to tableA.

```
var tableB = [
    {
        "MEETING_ID" : "16540576",
        "SPEAKER_FEE": 100.00
    },
    {
        "MEETING_ID" : "16540576",
        "SPEAKER_FEE": 120.00
    },
    {
        "MEETING_ID" : "16540577",
        "SPEAKER_FEE": 130.00
    },
    {
        "MEETING_ID" : "16540578",
        "SPEAKER_FEE": 140.00
    },
    {
        "MEETING_ID" : "16540578",
        "SPEAKER_FEE": 150.00
    },
    {
        "MEETING_ID" : "16540576",
        "SPEAKER_FEE": 160.00
    }
];
```

Now let's join and summarize into tableA.

```
rowjam(tableA).setTypes({'MEETING_ID' : 'string'}).joinAsSummary('fee_summary', 'MEETING_ID', tableB, 'MEETING_ID', ['SPEAKER_FEE'],[], '', 'SPEAKERS').dump();
> [
    {
        "MEETING_ID": "16540576",
        "EXPENSE_AMOUNT": "1000.00",
        "ESTIMATE_AMOUNT": "800.00",
        "START_DATE": "2015-04-13 08:00:00.000",
        "CATEGORY": "conference",
        "fee_summary": {
            "SPEAKERS": 3,
            "SPEAKER_FEE": 380
        }
    },
    {
        "MEETING_ID": "16540577",
        "EXPENSE_AMOUNT": "1030.00",
        "ESTIMATE_AMOUNT": "810.00",
        "START_DATE": "2015-04-13 08:00:00.000",
        "CATEGORY": "visit",
        "fee_summary": {
            "SPEAKERS": 1,
            "SPEAKER_FEE": 130
        }
    },
    {
        "MEETING_ID": "16540578",
        "EXPENSE_AMOUNT": "1000.00",
        "ESTIMATE_AMOUNT": "700.00",
        "START_DATE": "2015-04-17 08:00:00.000",
        "CATEGORY": "conference",
        "fee_summary": {
            "SPEAKERS": 2,
            "SPEAKER_FEE": 290
        }
    }
]
```

Let's merge the fields directly into the source table by supplying a blank saveColumn.

```
rowjam(tableA).setTypes({'MEETING_ID' : 'string'}).joinAsSummary('', 'MEETING_ID', tableB, 'MEETING_ID', ['SPEAKER_FEE'],[], '', 'SPEAKERS').dump();

>  [
      {
          "MEETING_ID": "16540576",
          "EXPENSE_AMOUNT": "1000.00",
          "ESTIMATE_AMOUNT": "800.00",
          "START_DATE": "2015-04-13 08:00:00.000",
          "CATEGORY": "conference",
          "SPEAKERS": 3,
          "SPEAKER_FEE": 380
      },
      {
          "MEETING_ID": "16540577",
          "EXPENSE_AMOUNT": "1030.00",
          "ESTIMATE_AMOUNT": "810.00",
          "START_DATE": "2015-04-13 08:00:00.000",
          "CATEGORY": "visit",
          "SPEAKERS": 1,
          "SPEAKER_FEE": 130
      },
      {
          "MEETING_ID": "16540578",
          "EXPENSE_AMOUNT": "1000.00",
          "ESTIMATE_AMOUNT": "700.00",
          "START_DATE": "2015-04-17 08:00:00.000",
          "CATEGORY": "conference",
          "SPEAKERS": 2,
          "SPEAKER_FEE": 290
      }
  ]
```
