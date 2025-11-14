$.ajax({
  type: "GET",
  url: "yesterday.csv",
  dataType: "csv",
  success: function(data) {
    var rows = data.split("\n");
    var chargesReport = [];
    for (var i = 0; i < rows.length; i++) {
      var row = rows[i].split(",");
      var customer_id = row[0];
      var entry_timestamp = row[1];
      var exit_timestamp = row[2];
      var duration_hours = calculateDuration(entry_timestamp, exit_timestamp);
      if (exit_timestamp <= entry_timestamp) {
        chargesReport.push([customer_id, duration_hours.toFixed(2), 0, "ERROR"]);
        continue;
      }
      var charge = calculateCharges(duration_hours);

      chargesReport.push([customer_id, duration_hours.toFixed(2), charge.toFixed(2), ""]);

      $.ajax({
        type: "POST",
        url: "charges_report.csv",
        data: "header=true&" + chargesReport.map(function(row) {
          return row.join(",");
        }).join("\n"),
        success: function() {
          console.log("Charges report written to charges_report.csv");
        }
      });
    }

    var totalReceipts = 0;
    var dailyMaxCustomers = 0;
    var averageCharge = 0;
    var longestStays = [];

    for (var i = 0; i < chargesReport.length; i++) {
      var charge = parseFloat(chargesReport[i][2]);
      if (charge > 10) {
        dailyMaxCustomers++;
      }
      totalReceipts += charge;

      if (longestStays.length == 0 || charge > longestStays[0].charge) {
        longestStays.push({ customer_id: chargesReport[i][0], charge: charge });
      } else if (charge === longestStays[0].charge) {
        longestStays.push({ customer_id: chargesReport[i][0], charge: charge });
      }
    }

    averageCharge = totalReceipts / chargesReport.length;

    console.log("Summary Statistics:");
    console.log(`Total Receipts: ${totalReceipts.toFixed(2)}`);
    console.log(`Number of Daily Max Customers: ${dailyMaxCustomers}`);
    console.log(`Average Charge: ${averageCharge.toFixed(2)}`);
    console.log("Longest Stays:");
    for (var i = 0; i < longestStays.length; i++) {
      console.log(`${longestStays[i].customer_id} - ${longestStays[i].charge.toFixed(2)}`);
    }
  }
});

function calculateDuration(entry_timestamp, exit_timestamp) {
  var entryDate = new Date(entry_timestamp);
  var exitDate = new Date(exit_timestamp);
  return Math.ceil((exitDate.getTime() - entryDate.getTime()) / (1000 * 3600));
}

function calculateCharges(duration_hours) {
  if (duration_hours <= 3) {
    return 2;
  } else {
    return 2 + Math.floor((duration_hours - 3) / 1) * 0.5;
  }

  var blocks = Math.ceil(duration_hours / 24);
  for (var i = 0; i < blocks; i++) {
    if ((blocks - i - 1) <= 2) {
      return Math.min(10, 2 + Math.floor((duration_hours % 24) / 1)*0.5);
    } else {
      return 10;
    }
  }

  return Math.min(30, blocks * 10);
}
