var curSlide = 1;
var data, yearLegal, margin, width, height, svg, sumstat, color, x, y, res;


async function init() {
  slide(curSlide);
}

function buttonHandler(value) {
  var btn_prev = d3.select("#btn_prev").attr("disabled", null);
  var btn_1 = d3.select("#btn_1").attr("disabled", null);
  var btn_2 = d3.select("#btn_2").attr("disabled", null);
  var btn_next = d3.select("#btn_next").attr("disabled", null);
  switch (value) {
    case -1:
      curSlide = curSlide - 1;
      break;
    case 0:
      curSlide = curSlide + 1;
      break;
    default:
      curSlide = value;
      break;
  }

  if (curSlide == 1) {
    btn_prev.attr("disabled", "disabled");
    btn_1.attr("disabled", "disabled");
  }
  else if (curSlide == 2) {
    btn_next.attr("disabled", "disabled");
    btn_2.attr("disabled", "disabled");
  }

  console.log(curSlide);

  slide(curSlide);
}

async function slide(curSlide) {
  switch (curSlide) {
    case 1:
      d3.select(".description")
        .select("p")
        .text(
          "Those 4 states legalized abortions in 1970, 3 years before Roe v Wade. Let's see what affect on crime it had 20 years later."
        );
      data = await d3.csv(
        "https://raw.githubusercontent.com/knasta2/CORGIS-Crime-Dataset/main/legal_before.csv"
      );
      yearLegal = 1970;
      break;
    case 2:
      d3.select(".description")
        .select("p")
        .text(
          "After abortions became legal in all of the states, there were still some states (for example Texas and Alabama) that didn't make abortions easily available. Let's compare those 2 states to states where abortions were easily available."
        );
      data = await d3.csv(
        "https://raw.githubusercontent.com/knasta2/CORGIS-Crime-Dataset/main/easily_available.csv"
      );
      yearLegal = 1973;
      break;
    default:
      curSlide = 1;
      d3.select(".description")
        .select("p")
        .text(
          "Those 4 states legalized abortions in 1970, 3 years before Roe v Wade. Let's see what affect on crime it had 20 years later."
        );
      data = await d3.csv(
        "https://raw.githubusercontent.com/knasta2/CORGIS-Crime-Dataset/main/legal_before.csv"
      );
      yearLegal = 1970;
      break;
  }

  // set the dimensions and margins of the graph
  (margin = { top: 10, right: 30, bottom: 30, left: 60 }),
    (width = 1280 - margin.left - margin.right),
    (height = 720 - margin.top - margin.bottom);
  
  d3.select("svg").remove();

  // append the svg object to the body of the page
    svg = d3
      .select("#viz")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // group the data: I want to draw one line per group
  sumstat = d3
    .nest() // nest function allows to group the calculation per level of a factor
    .key(function (d) {
      return d.State;
    })
    .entries(data);

  // Add X axis --> it is a date format
  x = d3
    .scaleLinear()
    .domain([
      d3.min(data, function (d) {
        return +d.Year;
      }),
      d3.max(data, function (d) {
        return +d.Year;
      }),
    ])
    .range([0, width]);
  svg
    .append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x).tickFormat(d3.format("d")));
  svg
    .append("g")
    .attr("class", "x axis")
    .call(x)
    .append("text")
    .attr("y", height - 20)
    .attr("x", width / 2)
    .attr("dy", ".71em")
    .style("text-anchor", "end")
    .text("Year");

  // Add Y axis
  y = d3
    .scaleLinear()
    .domain([
      0,
      d3.max(data, function (d) {
        return +d.ViolentAll;
      }),
    ])
    .range([height, 0]);
  svg.append("g").call(d3.axisLeft(y));
  svg
    .append("g")
    .attr("class", "y axis")
    .call(y)
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 6)
    .attr("dy", ".71em")
    .style("text-anchor", "end")
    .text("Reported Violent Offences per 100,000 population");

  // color palette
  res = sumstat.map(function (d) {
    return d.key;
  }); // list of group names
  color = d3
    .scaleOrdinal()
    .domain(res)
    .range([
      "#e41a1c",
      "#377eb8",
      "#4daf4a",
      "#984ea3",
      "#ff7f00",
      "#ffff33",
      "#a65628",
      "#f781bf",
      "#999999",
    ]);

  // Draw the line
  svg
    .selectAll(".line")
    .data(sumstat)
    .enter()
    .append("path")
    .attr("fill", "none")
    .attr("stroke", function (d) {
      return color(d.key);
    })
    .attr("stroke-width", 1.5)
    .attr("class", "line")
    .attr("d", function (d) {
      return d3
        .line()
        .x(function (d) {
          return x(d.Year);
        })
        .y(function (d) {
          return y(+d.ViolentAll);
        })(d.values);
    });

  svg
    .selectAll("mydots")
    .data(res)
    .enter()
    .append("circle")
    .attr("cx", width - 120)
    .attr("cy", function (d, i) {
      return 20 + i * 25;
    }) // 20 is where the first dot appears. 25 is the distance between dots
    .attr("r", 7)
    .style("fill", function (d) {
      return color(d);
    });

  svg
    .selectAll("mylabels")
    .data(res)
    .enter()
    .append("text")
    .attr("x", width - 100)
    .attr("y", function (d, i) {
      return 20 + i * 25;
    }) // 20 is where the first dot appears. 25 is the distance between dots
    .style("fill", function (d) {
      return color(d);
    })
    .text(function (d) {
      return d;
    })
    .attr("text-anchor", "left")
    .style("alignment-baseline", "middle");

  var mouseG = svg.append("g").attr("class", "mouse-over-effects");

  mouseG
    .append("path") // this is the black vertical line to follow mouse
    .attr("class", "mouse-line")
    .style("stroke", "black")
    .style("stroke-width", "1px")
    .style("opacity", "0");

  var lines = document.getElementsByClassName("line");

  var mousePerLine = mouseG
    .selectAll(".mouse-per-line")
    .data(res)
    .enter()
    .append("g")
    .attr("class", "mouse-per-line");

  mousePerLine
    .append("circle")
    .attr("r", 7)
    .style("stroke", function (d) {
      return color(d);
    })
    .style("fill", "none")
    .style("stroke-width", "1px")
    .style("opacity", "0");

  mousePerLine.append("text").attr("transform", "translate(10,3)");

  mouseG
    .append("svg:rect") // append a rect to catch mouse movements on canvas
    .attr("width", width) // can't catch mouse events on a g element
    .attr("height", height)
    .attr("fill", "none")
    .attr("pointer-events", "all")
    .on("mouseout", function () {
      // on mouse out hide line, circles and text
      d3.select(".mouse-line").style("opacity", "0");
      d3.selectAll(".mouse-per-line circle").style("opacity", "0");
      d3.selectAll(".mouse-per-line text").style("opacity", "0");
    })
    .on("mouseover", function () {
      // on mouse in show line, circles and text
      d3.select(".mouse-line").style("opacity", "1");
      d3.selectAll(".mouse-per-line circle").style("opacity", "1");
      d3.selectAll(".mouse-per-line text").style("opacity", "1");
    })
    .on("mousemove", function () {
      // mouse moving over canvas
      var mouse = d3.mouse(this);
      d3.select(".mouse-line").attr("d", function () {
        var d = "M" + mouse[0] + "," + height;
        d += " " + mouse[0] + "," + 0;
        return d;
      });

      d3.selectAll(".mouse-per-line").attr("transform", function (d, i) {
        console.log(width / mouse[0]);
        var xDate = x.invert(mouse[0]),
          bisect = d3.bisector(function (d) {
            return d.Year;
          }).right;
        idx = bisect(d, xDate);

        var beginning = 0,
          end = lines[i].getTotalLength(),
          target = null;

        while (true) {
          target = Math.floor((beginning + end) / 2);
          pos = lines[i].getPointAtLength(target);
          if ((target === end || target === beginning) && pos.x !== mouse[0]) {
            break;
          }
          if (pos.x > mouse[0]) end = target;
          else if (pos.x < mouse[0]) beginning = target;
          else break; //position found
        }

        d3.select(this).select("text").text(y.invert(pos.y).toFixed(2));

        return "translate(" + mouse[0] + "," + pos.y + ")";
      });
    });

  svg
    .append("line")
    .attr("x1", x(yearLegal)) //<<== change your code here
    .attr("y1", 0)
    .attr("x2", x(yearLegal)) //<<== and here
    .attr("y2", height)
    .style("stroke-width", 2)
    .style("stroke", "darkblue")
    .style("fill", "none");

  svg
    .append("line")
    .attr("x1", x(yearLegal + 20)) //<<== change your code here
    .attr("y1", 0)
    .attr("x2", x(yearLegal + 20)) //<<== and here
    .attr("y2", height)
    .style("stroke-width", 2)
    .style("stroke", "darkblue")
    .style("fill", "none");

  const type = d3.annotationLabel;
  const annotations = [
    {
      note: {
        label: "Abortions became legal",
        bgPadding: 20,
        //title: "Legal",
      },
      //can use x, y directly instead of data
      data: { Year: yearLegal, ViolentAll: 1000 },
      className: "show-bg",
      dy: -30,
      dx: -80,
    },
    {
      note: {
        label: "20 years after abortions became legal",
        bgPadding: 20,
        //title: "Legal",
      },
      //can use x, y directly instead of data
      data: { Year: yearLegal + 20, ViolentAll: 1000 },
      className: "show-bg",
      dy: -30,
      dx: -80,
    },
  ];

  const makeAnnotations = d3
    .annotation()
    .editMode(false)
    //also can set and override in the note.padding property
    //of the annotation object
    .notePadding(15)
    .type(type)
    //accessors & accessorsInverse not needed
    //if using x, y in annotations JSON
    .accessors({
      x: (d) => x(d.Year),
      y: (d) => y(d.ViolentAll),
    })
    .accessorsInverse({
      Year: (d) => x.invert(d.x),
      ViolentAll: (d) => y.invert(d.y),
    })
    .annotations(annotations);

  svg.append("g").attr("class", "annotation-group").call(makeAnnotations);
}
