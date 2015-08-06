module.exports = function(table, makeCopy) {
  var srcTable = table;
  return  {
    
    value: srcTable,
              
    filter: function(column, operator, value, caseSensitive)
          {
            var found = [];
            var matchCase = false;
            if (typeof(caseSensitive) === undefined || caseSensitive === null) matchCase = true;

            var table = this.value;
            var op = ['===', '=', '==','<', '>', '<=', '>=', 'empty', 'notempty', 'starts', 'contains'].indexOf(operator);
            if (value &&  typeof(value) === 'string' && matchCase) {
              value = value.toLowerCase();
            }
  
            for (var i=0, n=table.length; i<n; i++) {
              var row = table[i];
              var val = row[column];
              if (val && typeof val === 'string' && matchCase) {
                val = val.toLowerCase(val);
              }
              var keep = false;
              switch (op) {
              case 0:
              case 1:
              case 2:
                keep = val === value;
                break;
              case 3:
                keep = val < value;
                break;
              case 4:
                keep = val > value;
                break;
              case 5:
                keep = val <= value;
                break;
              case 6:
                keep = val >= value;
                break;
              case 7:
                keep = this.empty(val);
                break;
              case 8:
                keep = !this.empty(val);
                break;
              case 9: 
                keep = val.indexOf(value) === 0;
                break;
              case 10:
                keep = val.indexOf(value) >= 0;
                break;
              }
    
              if (keep) {
                found.push(row);
              }
            }
  
            this.value = found;
  
            return this;
          },
          
    copy: function() {
      var newMe = Object.create(module.prototype);
      newMe.value = module.copyValue(this.value);
      return newMe;      
    },

    setTypes: function(typeOptions) {
      var table = this.value;
      var n = table.length;
      var typeArr = ['string','number','boolean'];
      var typeLookup = {}
  
      // to avoid lookups later on
      for (var column in typeOptions) {
        var newType = typeOptions[column];
        typeLookup[column] = typeArr.indexOf(newType);
      }
  
      // iterate over each row
      for (var i=0; i<n; i++) {
        var row = table[i];
    
        // iterate over each column in each row
        for (var column in typeOptions) {
          var oldVal = row[column];
      
          switch (typeLookup[column]) {
          case 0:
            row[column] = String(oldVal);
            break;
          case 1:
            row[column] = Number(oldVal);
            break;
          case 2:
            if (oldVal === "0") {
              row[column] = false; // fix obscure javascript behavior
            } else {
              row[column] = Boolean(oldVal);
            }
            break;
          }
        }
      }  
        
      return this;
    },
    
    summarize: function(colsToSum, colsToConcat, delim, rowCountColumn) {
      var table = this.value;
      if (typeof(colsToSum) === 'undefined' || colsToSum === null) colsToSum = [];
      if (typeof(colsToConcat) === 'undefined' || colsToConcat === null) colsToConcat = [];
      if (typeof(delim) === 'undefined' || delim === null) delim = "\n";
      if (typeof(rowCountColumn) === 'undefined' || rowCountColumn === null) rowCountColumn = "";
  
      var summary = {};
  
      if (rowCountColumn.length > 0) {
        summary[rowCountColumn] = table.length;
      }
  
      // set number columns to 0.0
      for (var colIndex=0, nCols=colsToSum.length; colIndex<nCols; colIndex++) {
        var column = colsToSum[colIndex];
        summary[column] = 0.0;
      }
  
      // set text columns to ""
      for (var colIndex=0, nCols=colsToConcat.length; colIndex<nCols; colIndex++) {
        var column = colsToConcat[colIndex];
        summary[column] = "";
      }
  
  
      for (var rowIndex=0, nRows = table.length; rowIndex<nRows; rowIndex++) {
        var row = table[rowIndex];
        for (var colIndex=0, nCols=colsToSum.length; colIndex<nCols; colIndex++) {
          var column = colsToSum[colIndex];
          summary[column] += row[column];
        }
    
        for (var colIndex=0, nCols=colsToConcat.length; colIndex<nCols; colIndex++) {
          var column = colsToConcat[colIndex];
          if (summary[column].length > 0) {
            summary[column] += delim;
          }
          summary[column] += row[column];
        }
    
      }
      
      return summary;
    },
    
    toLookup: function(keyColumn)
    {
      var table = this.value;
  
      var lookup = {};
  
      var nRows=table.length;
  
      for (var i=0; i<nRows; i++) {
        var row = table[i];
        var primaryValue = row[keyColumn];
        if (lookup[primaryValue] === undefined) {
          lookup[primaryValue] = [row];
        } else {
          lookup[primaryValue].push(row);
        }
      }
  
      return lookup;
    },

    joinAsArray: function(saveColumn, srcColumn, joinTable, joinColumn)
    {
      var table = this.value;
      var lookup = new this(joinTable).toLookup(joinColumn);
  
      for (var i=0, n=table.length; i<n; i++) {
        var row = table[i];
        var rowId = row[srcColumn];
        var joinedArr = lookup[rowId];
        if (joinedArr && joinedArr != undefined) {
          row[saveColumn] = joinedArr;
        } else {
          row[saveColumn] = [];
        }
      }
  
      return this;
    },
    
    joinAsSummary: function(saveColumn, srcColumn, joinTable, joinColumn, colsToSum, colsToConcat, delim, rowCountColumn)
    {
      var table = this.value;
      var lookup = new this(joinTable).toLookup(joinColumn);
      if (colsToSum === undefined) {colsToSum = []};
      if (colsToConcat === undefined) {colsToConcat = []};
      if (delim === undefined) {delim = "\n"}
  
      for (var i=0, n=table.length; i<n; i++) {
        var row = table[i];
        var rowId = row[srcColumn];
        var joinedArr = lookup[rowId];
        if (joinedArr == undefined) {
          joinedArr = [];
        }
       var summary = new this(joinedArr).summarize(colsToSum, colsToConcat, delim, rowCountColumn);
       if (saveColumn.length === 0) {
         this.mergeProperties(row, summary);
       } else {
         row[saveColumn] = summary;
       }
      }
  
      return this;
    },
    
    values: function(column, unique) {
      var table = this.value;
      if (typeof(unique) === 'undefined' || unique === null) unique = true;
  
      var lookup = new Set();
  
      var found = [];
  
      for (var rowIndex=0, nRows = table.length; rowIndex<nRows; rowIndex++) {
        var row = table[rowIndex];
        var value = row[column];
    
        if (value) {
          if (unique === true) {
            if (!lookup.has(value)) {
              found.push(value);
            }
            lookup.add(value);
          } else {
            found.push(value)
          }
        }
      }
  
      return found;
    },
    
    empty: function(data)
      {
        if(typeof(data) == 'number' || typeof(data) == 'boolean')
        { 
          return false; 
        }
        if(typeof(data) == 'undefined' || data === null)
        {
          return true; 
        }
        if(typeof(data.length) != 'undefined')
        {
          return data.length == 0;
        }
        for(var i in data)
        {
          if(data.hasOwnProperty(i))
          {
            return false;
          }
        }
        return true;
      },
      
      to_json: function() {
        return JSON.stringify(this.value);
      },

      dump: function() {
        console.log(JSON.stringify(this.value, null, 4));
  
        return this;
      },
      
      mergeProperties: function(target, src) {
        for (var prop in src) {
          target[prop] = src[prop];
        }
        return target;
      },


      copyValue: function(oldObj) {
          var newObj = oldObj;
          if (oldObj && typeof oldObj === 'object') {
              newObj = Object.prototype.toString.call(oldObj) === "[object Array]" ? [] : {};
              for (var i in oldObj) {
                  newObj[i] = this.copyValue(oldObj[i]);
              }
          }
          return newObj;
      }      
  };
}
