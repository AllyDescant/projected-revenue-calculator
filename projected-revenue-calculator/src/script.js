// =============================
// Utils.js
// =============================
Array.eq = (a, b) => JSON.stringify(a) === JSON.stringify(b)

String.prototype.titleCase = function() {
  return this.toLowerCase().replace('_', ' ').split(' ').map(function(word) {
    return word.replace(word[0], word[0].toUpperCase())
  }).join(' ')
}

// =============================
// components/Calculator.js
// =============================
class Calculator extends React.Component {
  constructor(props) {
    super(props);

    const defaultState = {
      projected_revenue: 0,
      revenue_data: [],
      annual_revenue: [], // Array to hold annual revenue values
      growth_rate: 1.05, // Default to low growth rate
      total_months: 60, // Default to 60 months (5 years)
      product_price: 220,
      sales_per_month: 10,
    };

    this.state = { ...defaultState, ...this.props };
  }

  componentDidMount() {
    this.calculateRevenue();
  }

  componentDidUpdate(prevProps, prevState) {
    if (
      prevState.product_price !== this.state.product_price ||
      prevState.sales_per_month !== this.state.sales_per_month ||
      prevState.growth_rate !== this.state.growth_rate ||
      prevState.total_months !== this.state.total_months
    ) {
      this.calculateRevenue();
    }
  }

  render() {
    const { projected_revenue, growth_rate, total_months, annual_revenue } = this.state;

    return (
      <div className="container" style={{ gap: "20px" }}>
        <div className="calc-form">
          <h3>Revenue Calculator</h3>
          <NumberInput
            name="product_price"
            value={this.state.product_price}
            saveToState={this.saveToState.bind(this)}
          />
          <NumberInput
            name="sales_per_month"
            value={this.state.sales_per_month}
            saveToState={this.saveToState.bind(this)}
          />
          <div style={{ marginBottom: "15px" }}>
            <label>Growth Rate</label>
            <select
              name="growth_rate"
              value={growth_rate}
              onChange={this.saveToState.bind(this)}
              className="form-control"
            >
              <option value="1.02">Very Low (2%)</option>
              <option value="1.05">Low (5%)</option>
              <option value="1.09">Moderate (9%)</option>
              <option value="1.11">Above Average (11%)</option>
              <option value="1.15">High (15%)</option>
              <option value="1.2">Very High (20%)</option>
            </select>
          </div>
          <div style={{ marginBottom: "15px" }}>
            <label>Timespan (Months)</label>
            <input
              type="number"
              name="total_months"
              className="form-control"
              value={total_months}
              onChange={this.saveToState.bind(this)}
              min="1"
              max="120"
            />
          </div>
        </div>

        <div className="chart-section">
          <div id="myChart1" className="chart" />
          <InfoBox
            msg={`Total Projected Revenue: ${this.toUsd(projected_revenue)}`}
            type="info"
          />
        </div>

        {/* Annual Revenue Outputs */}
        <div className="annual-revenue">
          {annual_revenue.map((yearRevenue, index) => (
            <p key={index}>{`Year ${index + 1} ${this.toUsd(yearRevenue)}`}</p>
          ))}
        </div>
      </div>
    );
  }

  calculateRevenue() {
    const {
      product_price,
      sales_per_month,
      growth_rate,
      total_months,
    } = this.state;

    const revenue_data = Array(total_months).fill(0);
    const annual_revenue = [0, 0, 0, 0, 0]; // Initialize 5 years of revenue

    let sales = sales_per_month;

    for (let month = 1; month <= total_months; month++) {
      const revenue = sales * product_price;
      revenue_data[month - 1] = revenue;

      const yearIndex = Math.floor((month - 1) / 12); // Calculate which year it is
      annual_revenue[yearIndex] += revenue; // Accumulate monthly revenue to annual
      if (growth_rate) sales *= growth_rate;
    }

    const projected_revenue = revenue_data.reduce((sum, revenue) => sum + revenue, 0);
    this.setState({ projected_revenue, revenue_data, annual_revenue }, this.renderChart);
  }

  renderChart() {
    const labels = Array.from({ length: this.state.total_months }, (_, i) => `Month ${i + 1}`);
    const config1 = {
      id: "myChart1",
      data: {
        "scale-x": { labels },
        type: "line",
        title: { text: "Projected Revenue\nPer Month" },
        series: [{ values: this.state.revenue_data }],
      },
      chart: {
        "margin-left": "100px", // Increase left margin for Y-axis labels
        "margin-right": "50px", // Adjust right margin if needed
      }
    };
    zingchart.render(config1);
  }

  saveToState(e) {
    const { name, value } = e.target;
    const parsedValue = name === "growth_rate" && value ? parseFloat(value) : Number(value);
    this.setState({ [name]: parsedValue });
  }

  toUsd(number) {
    return number.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
    });
  }
}

// =============================
// components/InfoBox.js
// =============================
class InfoBox extends React.Component {
  render() {
    return (
      <div className={`alert alert-${this.props.type}`}>
        {this.props.msg}
      </div>
    )
  }
}

// =============================
// components/NumberInput.js
// =============================

// =============================
// components/NumberInput.js
// =============================
class NumberInput extends React.Component {
  render() {
    const { name, value, saveToState } = this.props;

    // Custom label mapping for specific names
    const labelMap = {
      product_price: "Product Price",
      sales_per_month: "Sales Per Month",
      // Add any additional mappings if needed
    };

    // Use mapped label or fall back to default title case transformation
    const label = labelMap[name] || name.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

    return (
      <div className="form-group">
        <label htmlFor={name}>{label}</label>
        <input
          type="number"
          name={name}
          className="form-control"
          value={value}
          onChange={saveToState}
        />
      </div>
    )
  }
}



// =============================
// index.js
// =============================
const initial_data = {
  product_price: 220,
  sales_per_month: 12,
  growth_rate: 1.05, // Default to low growth rate
  total_months: 60, // Default to 60 months (5 years)
};

ReactDOM.render(
  <Calculator {...initial_data} />,
  document.getElementById("calculator")
);


// Initialize wow.js animations
new WOW().init();

// Add event listener for buttons
document.querySelectorAll('.btn').forEach(button => {
  button.addEventListener('mouseenter', () => {
    button.style.backgroundColor = '#cc5200'; // Example hover color
  });
  button.addEventListener('mouseleave', () => {
    button.style.backgroundColor = '#ff6600'; // Original color
  });
});