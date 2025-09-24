import React, { useState } from "react";

const MaterialCalculator = () => {
  const [vendor, setVendor] = useState("select");
  const [mode, setMode] = useState("select");
  const [weight, setWeight] = useState("");

  const GST = 0.18;
  const TCS = 0.01;
  // const APEMCL = 0.07;

  const formatNumber = (num) => Number(num).toFixed(2);

  // ⬇️ move calculateValues BEFORE return
  const calculateValues = (vendor, mode, weight) => {
    let heteroRate = 0;
    let customsTax = 0;
    let pcbCharges = 0;
    let APEMCL = 0;
    if (vendor === "genetique") {
      if (mode === "etp") {
        heteroRate = 18.0;
        customsTax = heteroRate * 0.11;
        pcbCharges = 2.0;
        APEMCL = 0.07;
      } else if (mode === "stripper") {
        heteroRate = 4.0;
        customsTax = 0.0;
        pcbCharges = 1.0;
        APEMCL = 0.07;
      }
    } else if (vendor === "godavari") {
      if (mode === "etp") {
        heteroRate = 18.0;
        customsTax = heteroRate * 0.11;
        pcbCharges = 2.0;
        APEMCL = 0;
      } else if (mode === "stripper") {
        heteroRate = 4.0;
        customsTax = 0.0;
        //pcbCharges = 1.5;
        APEMCL = 0;
        // update PCB Charges based on heteroRate
        if (heteroRate < 15.0) {
          pcbCharges = 1.5;
        } else {
          pcbCharges = 2.0;
        }
      }
    } else if (vendor === "balaji") {
      if (mode === "etp") {
        heteroRate = 18.0;
        customsTax = heteroRate * 0.11;
        pcbCharges = 2.0;
        APEMCL = 0;
      } else if (mode === "stripper") {
        heteroRate = 4.0;
        customsTax = 0.0;
        pcbCharges = 1.5;
        APEMCL = 0;
      }
    }

    const materialCost = heteroRate + customsTax;
    const materialPriceHetero = materialCost * weight;
    const gstHetero = materialPriceHetero * GST;
    const materialPriceGst = materialPriceHetero + gstHetero;
    const tcs = materialPriceGst * TCS;
    const genetiqueToHetero = materialPriceGst + tcs;

    const genetiqueMaterialCost = heteroRate + customsTax + pcbCharges + APEMCL;
    const materialPriceGenetique = genetiqueMaterialCost * weight;
    const gstGenetique = materialPriceGenetique * GST;
    const vpcsToGenetique = materialPriceGenetique + gstGenetique;

    return {
      heteroRate,
      customsTax,
      pcbCharges,
      materialCost,
      materialPriceHetero,
      gstHetero,
      materialPriceGst,
      tcs,
      genetiqueToHetero,
      genetiqueMaterialCost,
      materialPriceGenetique,
      gstGenetique,
      vpcsToGenetique,
      apemclCharges: APEMCL,
    };
  };

  const {
    heteroRate,
    customsTax,
    pcbCharges,
    materialCost,
    materialPriceHetero,
    gstHetero,
    materialPriceGst,
    tcs,
    genetiqueToHetero,
    genetiqueMaterialCost,
    materialPriceGenetique,
    gstGenetique,
    vpcsToGenetique,
    apemclCharges,
  } = calculateValues(vendor, mode, weight);

  // ✅ only ONE return
  return (
    <div className="container">
      <h1>Material Cost Calculation</h1>

      <div className="input-section">
        <label>Vendor:</label>
        <select
          value={vendor}
          onChange={(e) => setVendor(e.target.value)}
          style={{ width: "100%", padding: "8px", fontSize: "1rem" }}
        >
          <option value="select">Select Vendor</option>
          <option value="genetique">Genetique Pro</option>
          <option value="godavari">Godavari Fine Chem</option>
          <option value="balaji">Sri Balaji Industries</option>
        </select>

        <label>Material:</label>
        <select
          value={mode}
          onChange={(e) => setMode(e.target.value)}
          style={{ width: "100%", padding: "8px", fontSize: "1rem" }}
        >
          <option value="select">Select Material</option>
          <option value="etp">ETP</option>
          <option value="stripper">Stripper</option>
        </select>

        <label>Weight:</label>
        <input
          type="number"
          value={weight}
          min="0"
          step="1"
          placeholder="Enter material weight"
          onChange={(e) => setWeight(parseFloat(e.target.value) || 0)}
          style={{
            width: "100%",
            padding: "8px",
            fontSize: "1rem",
            textAlign: "left",
          }}
        />
      </div>

      {/* Results table continues here... */}

      {/* ✅ Results Table */}
      <div className="results-table">
        <div className="table-row header">
          <div className="component">Component</div>
          <div className="value">Value</div>
          <div className="comments">Comments</div>
        </div>

        <div className="table-row">
          <div className="component">Total Weight</div>
          <div className="value">{formatNumber(weight)}</div>
          <div className="comments">Total weight of the material.</div>
        </div>

        <div className="table-row">
          <div className="component">Hetero material Rate</div>
          <div className="value">{formatNumber(heteroRate)}</div>
          <div className="comments">Rate per unit for Hetero material.</div>
        </div>

        <div className="table-row">
          <div className="component">Customs Tax</div>
          <div className="value">{formatNumber(customsTax)}</div>
          <div className="comments">Vendor-specific customs tax.</div>
        </div>

        <div className="table-row">
          <div className="component">Material cost</div>
          <div className="value">{formatNumber(materialCost)}</div>
          <div className="comments">Hetero rate + Customs tax.</div>
        </div>

        <div className="table-row">
          <div className="component">Material Price @Hetero</div>
          <div className="value">{formatNumber(materialPriceHetero)}</div>
          <div className="comments">Material cost * Weight.</div>
        </div>

        <div className="table-row">
          <div className="component">GST</div>
          <div className="value">{formatNumber(gstHetero)}</div>
          <div className="comments">18% of Material Price @ Hetero.</div>
        </div>

        <div className="table-row">
          <div className="component">Material price + GST</div>
          <div className="value">{formatNumber(materialPriceGst)}</div>
          <div className="comments">Sum of Material Price @ Hetero and GST.</div>
        </div>

        <div className="table-row">
          <div className="component">TCS</div>
          <div className="value">{formatNumber(tcs)}</div>
          <div className="comments">1% of (Material price + GST).</div>
        </div>

        <div className="table-row highlight">
          <div className="component">Genetique to Hetero</div>
          <div className="value">{formatNumber(genetiqueToHetero)}</div>
          <div className="comments">Material price + GST + TCS.</div>
        </div>

        <div className="table-row">
          <div className="component">PCB Charges</div>
          <div className="value">{formatNumber(pcbCharges)}</div>
          <div className="comments">Vendor-specific PCB Charges.</div>
        </div>

        <div className="table-row">
          <div className="component">APEMCL charges</div>
          <div className="value">{formatNumber(apemclCharges)}</div>
          <div className="comments">Fixed APEMCL charge.</div>
        </div>

        <div className="table-row">
          <div className="component">Genetique material cost</div>
          <div className="value">{formatNumber(genetiqueMaterialCost)}</div>
          <div className="comments">Hetero rate + Customs tax + PCB + APEMCL.</div>
        </div>

        <div className="table-row">
          <div className="component">Material Price @ Genetique</div>
          <div className="value">{formatNumber(materialPriceGenetique)}</div>
          <div className="comments">Genetique material cost * Weight.</div>
        </div>

        <div className="table-row">
          <div className="component">GST @ Genetique</div>
          <div className="value">{formatNumber(gstGenetique)}</div>
          <div className="comments">18% of Material Price @ Genetique.</div>
        </div>

        <div className="table-row highlight">
          <div className="component">VPCS to Genetique</div>
          <div className="value">{formatNumber(vpcsToGenetique)}</div>
          <div className="comments">Material price @ Genetique + GST.</div>
        </div>
      </div>
    </div>
  );
};

export default MaterialCalculator;
