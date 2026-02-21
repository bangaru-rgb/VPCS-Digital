import React, { useState, useEffect } from "react";

const formatCurrency = (num) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(num);
};

const formatNumber = (num) => Number(num).toFixed(2);

const MaterialCalculator = () => {
  const [vendor, setVendor] = useState("");
  const [material, setMaterial] = useState("");
  const [weight, setWeight] = useState("");
  const [heteroRate, setHeteroRate] = useState("");
  const [customsTax, setCustomsTax] = useState("");
  const [pcbCharges, setPcbCharges] = useState("");
  const [apemclCharges, setApemclCharges] = useState("");
  const [copySuccess, setCopySuccess] = useState(false);
  const [editingField, setEditingField] = useState(null);

  const GST = 0.18;
  const TCS = 0.01;

  useEffect(() => {
    if (vendor && material) {
      const defaults = getDefaultValues(vendor, material);
      setHeteroRate(defaults.heteroRate);
      setCustomsTax(defaults.customsTax);
      setPcbCharges(defaults.pcbCharges);
      setApemclCharges(defaults.apemclCharges);
    } else {
      setHeteroRate("");
      setCustomsTax("");
      setPcbCharges("");
      setApemclCharges("");
    }
  }, [vendor, material]);

  const getDefaultValues = (vendor, material) => {
    let heteroRate = 0;
    let customsTax = 0;
    let pcbCharges = 0;
    let apemclCharges = 0;

    if (vendor === "Genetique") {
      if (material === "ETP") {
        heteroRate = 18.0;
       // customsTax = heteroRate * 0.11;
        pcbCharges = 2.0;
        apemclCharges = 0.07;
        customsTax = 0.0;
      } else if (material === "Stripper") {
        heteroRate = 4.0;
        customsTax = 0.0;
        pcbCharges = 1.0;
        apemclCharges = 0.07;
      }
    } else if (vendor === "Godavari") {
      if (material === "ETP") {
        heteroRate = 18.0;
       // customsTax = heteroRate * 0.11;
        pcbCharges = 2.0;
        apemclCharges = 0;
        customsTax = 0.0;
      } else if (material === "Stripper") {
        heteroRate = 4.0;
        customsTax = 0.0;
        pcbCharges = heteroRate < 15.0 ? 1.5 : 2.0;
        apemclCharges = 0;
      }
    } else if (vendor === "Balaji") {
      if (material === "ETP") {
        heteroRate = 18.0;
        //customsTax = heteroRate * 0.11;
        pcbCharges = 2.0;
        apemclCharges = 0;
        customsTax = 0.0;
      } else if (material === "Stripper") {
        heteroRate = 4.0;
        customsTax = 0.0;
        pcbCharges = 1.5;
        apemclCharges = 0;
      }
    }

    return { heteroRate, customsTax, pcbCharges, apemclCharges };
  };

  const vendorLabels = {
    Genetique: {
      toHetero: "Genetique to Hetero",
      toVendor: "VPCS to Genetique",
    },
    Godavari: {
      toHetero: "Godavari to Hetero",
      toVendor: "VPCS to Godavari",
    },
    Balaji: {
      toHetero: "Sri Balaji to Hetero",
      toVendor: "VPCS to Sri Balaji",
    },
  };

  const selectedLabels = vendorLabels[vendor] || {
    toHetero: "Vendor to Hetero",
    toVendor: "VPCS to Vendor",
  };

  const vendorDisplayNames = {
    Genetique: "Genetique Pro",
    Godavari: "Godavari Fine Chem",
    Balaji: "Sri Balaji Industries",
  };

  const currentVendorName = vendorDisplayNames[vendor] || "Vendor";

  const weightNum = parseFloat(weight) || 0;
  const heteroRateNum = parseFloat(heteroRate) || 0;
  const customsTaxNum = parseFloat(customsTax) || 0;
  const pcbChargesNum = parseFloat(pcbCharges) || 0;
  const apemclChargesNum = parseFloat(apemclCharges) || 0;

  const materialCost = heteroRateNum + customsTaxNum;
  const materialPriceHetero = materialCost * weightNum;
  const gstHetero = materialPriceHetero * GST;
  const materialPriceGst = materialPriceHetero + gstHetero;
  const tcs = materialPriceGst * TCS;
  const genetiqueToHetero = materialPriceGst + tcs;

  const genetiqueMaterialCost = heteroRateNum + customsTaxNum + pcbChargesNum + apemclChargesNum;
  const materialPriceGenetique = genetiqueMaterialCost * weightNum;
  const gstGenetique = materialPriceGenetique * GST;
  const vpcsToGenetique = materialPriceGenetique + gstGenetique;

  const handleCopySummary = async () => {
    const materialName = material === "" ? "Material" : material;
    const summaryText = `${materialName} weight: ${weight || 0} kg\n${selectedLabels.toHetero}: ${formatCurrency(genetiqueToHetero)}\n${selectedLabels.toVendor}: ${formatCurrency(vpcsToGenetique)}`;

    try {
      await navigator.clipboard.writeText(summaryText);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      const textArea = document.createElement('textarea');
      textArea.value = summaryText;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const resultItems = [
    { label: "Material cost", value: materialCost, comment: "Hetero rate + Customs tax.", isCurrency: true },
    { label: "Material Price @Hetero", value: materialPriceHetero, comment: "Material cost × Weight.", isCurrency: true },
    { label: "GST", value: gstHetero, comment: "18% of Material Price @ Hetero.", isCurrency: true },
    { label: "Material price + GST", value: materialPriceGst, comment: "Sum of Material Price @ Hetero and GST.", isCurrency: true },
    { label: "TCS", value: tcs, comment: "1% of (Material price + GST).", isCurrency: true },
    { label: selectedLabels.toHetero, value: genetiqueToHetero, comment: "Material price + GST + TCS.", highlight: true, isCurrency: true },
    { label: `${currentVendorName} material cost`, value: genetiqueMaterialCost, comment: `Hetero rate + Customs tax + PCB + APEMCL.`, isCurrency: true },
    { label: `Material Price @ ${currentVendorName}`, value: materialPriceGenetique, comment: `${currentVendorName} material cost × Weight.`, isCurrency: true },
    { label: `GST @ ${currentVendorName}`, value: gstGenetique, comment: `18% of Material Price @ ${currentVendorName}.`, isCurrency: true },
    { label: selectedLabels.toVendor, value: vpcsToGenetique, comment: `Material price @ ${currentVendorName} + GST.`, highlight: true, isCurrency: true },
  ];

  return (
    <>
      <style>{`
        * {
          box-sizing: border-box;
        }
        
        body {
          margin: 0;
          padding: 0;
        }

        .calc-wrapper {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 20px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', sans-serif;
        }

        .calc-container {
          max-width: 900px;
          margin: 0 auto;
        }

        .calc-header {
          text-align: center;
          margin-bottom: 32px;
          animation: fadeInDown 0.6s ease-out;
        }

        .calc-title {
          font-size: 2.5rem;
          font-weight: 800;
          color: #ffffff;
          margin: 0 0 8px 0;
          text-shadow: 0 2px 4px rgba(0,0,0,0.1);
          letter-spacing: -0.5px;
        }

        .calc-subtitle {
          font-size: 1rem;
          color: rgba(255,255,255,0.9);
          margin: 0;
          font-weight: 400;
        }

        .input-card {
          background: #ffffff;
          border-radius: 20px;
          padding: 28px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.15);
          margin-bottom: 24px;
          animation: fadeInUp 0.6s ease-out;
        }

        .input-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 20px;
        }

        .input-row-full {
          display: grid;
          grid-template-columns: 1fr;
          gap: 20px;
          margin-bottom: 20px;
        }

        .input-field {
          position: relative;
        }

        .input-field label {
          display: block;
          font-size: 0.85rem;
          font-weight: 600;
          color: #4a5568;
          margin-bottom: 8px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .input-field select,
        .input-field input {
          width: 100%;
          height: 52px;
          padding: 0 16px;
          font-size: 1rem;
          font-weight: 500;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          background: #f7fafc;
          color: #2d3748;
          transition: all 0.3s ease;
          appearance: none;
        }

        .input-field input[type="text"][inputmode="decimal"],
        .input-field input[type="number"] {
          text-align: right;
          font-variant-numeric: tabular-nums;
        }

        .input-field select {
          background-image: url("data:image/svg+xml;utf8,<svg fill='%234a5568' height='20' viewBox='0 0 20 20' width='20' xmlns='http://www.w3.org/2000/svg'><path d='M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z'/></svg>");
          background-repeat: no-repeat;
          background-position: right 12px center;
          background-size: 20px;
          padding-right: 40px;
        }

        .input-field input:focus,
        .input-field select:focus {
          outline: none;
          border-color: #667eea;
          background: #ffffff;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .input-hint {
          font-size: 0.75rem;
          color: #718096;
          margin-top: 6px;
          display: block;
        }

        .section-divider {
          height: 1px;
          background: linear-gradient(to right, transparent, #e2e8f0, transparent);
          margin: 28px 0;
        }

        .summary-box {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 20px;
          padding: 24px;
          margin-bottom: 24px;
          box-shadow: 0 20px 60px rgba(102, 126, 234, 0.3);
          animation: fadeInUp 0.7s ease-out;
          position: relative;
          overflow: hidden;
        }

        .summary-box::before {
          content: '';
          position: absolute;
          top: -50%;
          right: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
          animation: shimmer 3s infinite;
        }

        @keyframes shimmer {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(-30px, -30px); }
        }

        .summary-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          position: relative;
          z-index: 1;
        }

        .summary-title {
          font-size: 1.4rem;
          font-weight: 700;
          color: #ffffff;
          margin: 0;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .summary-icon {
          font-size: 1.5rem;
        }

        .copy-btn {
          background: rgba(255,255,255,0.2);
          border: 2px solid rgba(255,255,255,0.3);
          border-radius: 10px;
          padding: 8px 16px;
          color: #ffffff;
          font-weight: 600;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
        }

        .copy-btn:hover {
          background: rgba(255,255,255,0.3);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }

        .copy-btn:active {
          transform: translateY(0);
        }

        .summary-items {
          position: relative;
          z-index: 1;
        }

        .summary-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 14px 0;
          border-bottom: 1px solid rgba(255,255,255,0.15);
        }

        .summary-row:last-child {
          border-bottom: none;
        }

        .summary-label {
          font-size: 1rem;
          color: rgba(255,255,255,0.95);
          font-weight: 500;
        }

        .summary-value {
          font-size: 1.3rem;
          font-weight: 700;
          color: #ffffff;
          font-variant-numeric: tabular-nums;
        }

        .results-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 16px;
          animation: fadeInUp 0.8s ease-out;
        }

        .result-item {
          background: #ffffff;
          border-radius: 16px;
          padding: 20px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
          transition: all 0.3s ease;
          border-left: 4px solid #e2e8f0;
        }

        .result-item:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 24px rgba(0,0,0,0.12);
        }

        .result-item.highlight {
          background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%);
          border-left: 4px solid #667eea;
        }

        .result-label {
          font-size: 0.85rem;
          font-weight: 600;
          color: #4a5568;
          margin-bottom: 8px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .result-value {
          font-size: 1.6rem;
          font-weight: 700;
          color: #667eea;
          margin-bottom: 8px;
          font-variant-numeric: tabular-nums;
        }

        .result-item.highlight .result-value {
          font-size: 1.8rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .result-hint {
          font-size: 0.8rem;
          color: #718096;
          line-height: 1.4;
        }

        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 768px) {
          .calc-wrapper {
            padding: 16px;
          }

          .calc-title {
            font-size: 1.8rem;
          }

          .calc-subtitle {
            font-size: 0.9rem;
          }

          .input-card {
            padding: 20px;
          }

          .input-row {
            grid-template-columns: 1fr;
            gap: 16px;
          }

          .summary-box {
            padding: 20px;
          }

          .summary-title {
            font-size: 1.2rem;
          }

          .summary-value {
            font-size: 1.1rem;
          }

          .results-grid {
            grid-template-columns: 1fr;
            gap: 12px;
          }

          .result-value {
            font-size: 1.4rem;
          }

          .result-item.highlight .result-value {
            font-size: 1.5rem;
          }
        }
      `}</style>

      <div className="calc-wrapper">
        <div className="calc-container">
          <div className="calc-header">
            <h1 className="calc-title">Material Calculator</h1>
            <p className="calc-subtitle">Calculate material costs with precision</p>
          </div>

          <div className="input-card">
            <div className="input-row">
              <div className="input-field">
                <label>Vendor</label>
                <select value={vendor} onChange={(e) => setVendor(e.target.value)}>
                  <option value="">Select Vendor</option>
                  <option value="Genetique">Genetique Pro</option>
                  <option value="Godavari">Godavari Fine Chem</option>
                  <option value="Balaji">Sri Balaji Industries</option>
                </select>
              </div>

              <div className="input-field">
                <label>Material</label>
                <select value={material} onChange={(e) => setMaterial(e.target.value)}>
                  <option value="">Select Material</option>
                  <option value="ETP">ETP</option>
                  <option value="Stripper">Stripper</option>
                </select>
              </div>
            </div>

            <div className="section-divider"></div>

            <div className="input-row">
              <div className="input-field">
                <label>Weight (kg)</label>
                <input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
                <span className="input-hint">Total material weight</span>
              </div>

              <div className="input-field">
                <label>Hetero Rate (₹/kg)</label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={editingField === 'heteroRate' ? heteroRate : (heteroRate === "" ? "" : parseFloat(heteroRate).toFixed(2))}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9.]/g, '');
                    setHeteroRate(val);
                  }}
                  onFocus={(e) => {
                    setEditingField('heteroRate');
                    e.target.select();
                  }}
                  onBlur={() => setEditingField(null)}
                  placeholder="0.00"
                />
                <span className="input-hint">Rate per unit</span>
              </div>
            </div>

            <div className="input-row">
              <div className="input-field">
                <label>Customs Tax (₹/kg)</label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={editingField === 'customsTax' ? customsTax : (customsTax === "" ? "" : parseFloat(customsTax).toFixed(2))}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9.]/g, '');
                    setCustomsTax(val);
                  }}
                  onFocus={(e) => {
                    setEditingField('customsTax');
                    e.target.select();
                  }}
                  onBlur={() => setEditingField(null)}
                  placeholder="0.00"
                />
                <span className="input-hint">Vendor customs tax</span>
              </div>

              <div className="input-field">
                <label>PCB Charges (₹/kg)</label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={editingField === 'pcbCharges' ? pcbCharges : (pcbCharges === "" ? "" : parseFloat(pcbCharges).toFixed(2))}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9.]/g, '');
                    setPcbCharges(val);
                  }}
                  onFocus={(e) => {
                    setEditingField('pcbCharges');
                    e.target.select();
                  }}
                  onBlur={() => setEditingField(null)}
                  placeholder="0.00"
                />
                <span className="input-hint">PCB charges per kg</span>
              </div>
            </div>

            <div className="input-row-full">
              <div className="input-field">
                <label>APEMCL Charges (₹/kg)</label>
                <input
                  type="number"
                  value={apemclCharges}
                  onChange={(e) => setApemclCharges(e.target.value)}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
                <span className="input-hint">Fixed APEMCL charge</span>
              </div>
            </div>
          </div>

          <div className="summary-box">
            <div className="summary-header">
              <h2 className="summary-title">
                <span className="summary-icon">📊</span>
                Quick Summary
              </h2>
              <button className="copy-btn" onClick={handleCopySummary}>
                {copySuccess ? '✓ Copied!' : '📋 Copy'}
              </button>
            </div>
            <div className="summary-items">
              <div className="summary-row">
                <span className="summary-label">{selectedLabels.toHetero}</span>
                <span className="summary-value">{formatCurrency(genetiqueToHetero)}</span>
              </div>
              <div className="summary-row">
                <span className="summary-label">{selectedLabels.toVendor}</span>
                <span className="summary-value">{formatCurrency(vpcsToGenetique)}</span>
              </div>
            </div>
          </div>

          <div className="results-grid">
            {resultItems.map((item, index) => (
              <div className={`result-item ${item.highlight ? "highlight" : ""}`} key={`${item.label}-${index}`}>
                <div className="result-label">{item.label}</div>
                <div className="result-value">
                  {item.isCurrency ? formatCurrency(item.value) : formatNumber(item.value)}
                </div>
                <div className="result-hint">{item.comment}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default MaterialCalculator;