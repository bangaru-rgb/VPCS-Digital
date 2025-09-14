import React from "react";
import "./assets/css/style.css";
import "./assets/css/responsive.css";

function MaterialCalculator() {
  return (
    <div className="container">
      <h1>Material Cost Calculation</h1>

      {/* Input Section */}
      <div className="input-section">
        <label htmlFor="mode-selector">Material:</label>
        <select
          id="mode-selector"
          style={{ width: "100%", padding: "8px", fontSize: "1rem" }}
        >
          <option value="select">Select</option>
          <option value="etp">ETP</option>
          <option value="stripper">Stripper</option>
        </select>

        <label htmlFor="weight">Weight:</label>
        <input
          type="number"
          id="weight"
          min="0"
          step="1"
          placeholder="Enter weight"
          style={{
            width: "100%",
            padding: "8px",
            fontSize: "1rem",
            textAlign: "left",
          }}
        />
      </div>

      {/* Results Table */}
      <div className="results-table">
        <div className="table-row header">
          <div className="component">Component</div>
          <div className="value">Value</div>
          <div className="comments">Comments</div>
        </div>

        <div className="table-row">
          <div className="component">Total Weight</div>
          <div className="value" id="display-etp-weight"></div>
          <div className="comments">Total weight of the material.</div>
        </div>

        <div className="table-row">
          <div className="component">Hetero material Rate</div>
          <div className="value" id="display-hetero-rate"></div>
          <div className="comments">Rate per unit for Hetero material.</div>
        </div>

        <div className="table-row">
          <div className="component">Customs Tax</div>
          <div className="value" id="display-customs-tax"></div>
          <div className="comments">
            11% of Hetero Material Rate for ETP, it is NA for Stripper.
          </div>
        </div>

        <div className="table-row">
          <div className="component">Material cost</div>
          <div className="value" id="display-material-cost"></div>
          <div className="comments">Hetero rate + Customs tax</div>
        </div>

        <div className="table-row">
          <div className="component">Material Price @Hetero</div>
          <div className="value" id="display-material-price-hetero"></div>
          <div className="comments">Material cost * Weight</div>
        </div>

        <div className="table-row">
          <div className="component">GST</div>
          <div className="value" id="display-gst-hetero"></div>
          <div className="comments">18% of Material Price @ Hetero.</div>
        </div>

        <div className="table-row">
          <div className="component">Material price+GST</div>
          <div className="value" id="display-material-price-gst"></div>
          <div className="comments">
            Sum of Material Price @ Hetero and GST.
          </div>
        </div>

        <div className="table-row">
          <div className="component">TCS</div>
          <div className="value" id="display-tcs"></div>
          <div className="comments">1% of (Material price+GST)</div>
        </div>

        <div className="table-row highlight">
          <div className="highlight">Genetique to Hetero</div>
          <div className="value" id="display-genetique-to-hetero"></div>
          <div className="comments">Material price+GST+TCS</div>
        </div>

        <div className="table-row">
          <div className="component">PCB Charges</div>
          <div className="value" id="display-pcb-charges"></div>
          <div className="comments">PCB Charges ETP 2.00, Stripper 1.00</div>
        </div>

        <div className="table-row">
          <div className="component">APEMCL charges</div>
          <div className="value">0.07</div>
          <div className="comments">Additional charges for APEMCL.</div>
        </div>

        <div className="table-row">
          <div className="component">Genetique material cost</div>
          <div className="value" id="display-genetique-material-cost"></div>
          <div className="comments">
            Hetero rate + Customs tax + PCB charges + MPCL Charges
          </div>
        </div>

        <div className="table-row">
          <div className="component">Material Price @ Genetique</div>
          <div className="value" id="display-material-price-genetique"></div>
          <div className="comments">Genetique material cost * Weight</div>
        </div>

        <div className="table-row">
          <div className="component">GST</div>
          <div className="value" id="display-gst-genetique"></div>
          <div className="comments">18% of Material price @Genetique</div>
        </div>

        <div className="table-row highlight">
          <div className="highlight">VPCS to Genetique</div>
          <div className="value" id="display-vpcs-to-genetique"></div>
          <div className="comments">
            Material Price @ Genetique + GST
          </div>
        </div>
      </div>
    </div>
  );
}

export default MaterialCalculator;
