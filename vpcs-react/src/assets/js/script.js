import './assets/css/style.css';
import './assets/css/responsive.css';

document.addEventListener('DOMContentLoaded', () => {
    const modeSelector = document.getElementById('mode-selector');
    const weightInput = document.getElementById('weight');

    const formatNumber = (num) => num.toFixed(2);

    const GST_PERCENTAGE = 0.18;
    const TCS_PERCENTAGE = 0.01;


    const calculateCosts = () => {
        const mode = modeSelector.value;
        let weight = parseFloat(weightInput.value);

        if (isNaN(weight) || weight < 0) {
            weight = 0;
        }
        // Define rates based on mode
        let HETERO_MATERIAL_RATE;
        let CUSTOMS_TAX_PERCENTAGE;
        let PCB_CHARGES;
        let APEMCL_CHARGES;
        //let STRIPPER_HETERO_RATE;

        if (mode === 'etp') {
            HETERO_MATERIAL_RATE = 18.00;
            CUSTOMS_TAX_PERCENTAGE = 0.11;
            PCB_CHARGES = 2.00;
            APEMCL_CHARGES = 0.07;
            const heteroRateEl = document.getElementById('display-hetero-rate');
            heteroRateEl.textContent = formatNumber(HETERO_MATERIAL_RATE);


            document.getElementById('display-etp-weight').textContent = formatNumber(weight);

            const customsTax = HETERO_MATERIAL_RATE * CUSTOMS_TAX_PERCENTAGE;
            document.getElementById('display-customs-tax').textContent = formatNumber(customsTax);

            const materialCost = HETERO_MATERIAL_RATE + customsTax;
            document.getElementById('display-material-cost').textContent = formatNumber(materialCost);

            const materialPriceHetero = materialCost * weight;
            document.getElementById('display-material-price-hetero').textContent = formatNumber(materialPriceHetero);

            const gstHetero = materialPriceHetero * GST_PERCENTAGE;
            document.getElementById('display-gst-hetero').textContent = formatNumber(gstHetero);

            const materialPriceGst = materialPriceHetero + gstHetero;
            document.getElementById('display-material-price-gst').textContent = formatNumber(materialPriceGst);

            const tcs = materialPriceGst * TCS_PERCENTAGE;
            document.getElementById('display-tcs').textContent = formatNumber(tcs);

            const genetiqueToHetero = materialPriceGst + tcs;
            document.getElementById('display-genetique-to-hetero').textContent = formatNumber(genetiqueToHetero);
            document.getElementById('display-pcb-charges').textContent = '2.00';
            const genetiqueMaterialCost = HETERO_MATERIAL_RATE + customsTax + PCB_CHARGES + APEMCL_CHARGES;
            document.getElementById('display-genetique-material-cost').textContent = formatNumber(genetiqueMaterialCost);

            const materialPriceGenetique = genetiqueMaterialCost * weight;
            document.getElementById('display-material-price-genetique').textContent = formatNumber(materialPriceGenetique);

            const gstGenetique = materialPriceGenetique * GST_PERCENTAGE;
            document.getElementById('display-gst-genetique').textContent = formatNumber(gstGenetique);

            const vpcsToGenetique = materialPriceGenetique + gstGenetique;
            document.getElementById('display-vpcs-to-genetique').textContent = formatNumber(vpcsToGenetique);
        } else if (mode === 'stripper') {
            //weight = 23000; // Corrected weight

            HETERO_MATERIAL_RATE = 4.00;
            PCB_CHARGES = 1.00;
            CUSTOMS_TAX_PERCENTAGE = 0.00;
            APEMCL_CHARGES = 0.07;
            const heteroRateEl = document.getElementById('display-hetero-rate');
            heteroRateEl.textContent = formatNumber(HETERO_MATERIAL_RATE);

            document.getElementById('display-etp-weight').textContent = formatNumber(weight);

            const materialPriceHetero = HETERO_MATERIAL_RATE * weight;
            document.getElementById('display-material-price-hetero').textContent = formatNumber(materialPriceHetero);

            const gstHetero = materialPriceHetero * GST_PERCENTAGE;
            document.getElementById('display-gst-hetero').textContent = formatNumber(gstHetero);

            const materialPriceGst = materialPriceHetero + gstHetero;
            document.getElementById('display-material-price-gst').textContent = formatNumber(materialPriceGst);

            const tcs = materialPriceGst * TCS_PERCENTAGE;
            document.getElementById('display-tcs').textContent = formatNumber(tcs);

            const genetiqueToHetero = materialPriceGst + tcs;
            document.getElementById('display-genetique-to-hetero').textContent = formatNumber(genetiqueToHetero);

            document.getElementById('display-customs-tax').textContent = '0.00'; // Not applicable
            document.getElementById('display-pcb-charges').textContent = '1.00';

            const heteroPlusPCB = HETERO_MATERIAL_RATE + PCB_CHARGES;
            document.getElementById('display-material-cost').textContent = formatNumber(heteroPlusPCB);

            const genetiqueMaterialCost = heteroPlusPCB + APEMCL_CHARGES;
            document.getElementById('display-genetique-material-cost').textContent = formatNumber(genetiqueMaterialCost);

            const materialPriceGenetique = genetiqueMaterialCost * weight;
            document.getElementById('display-material-price-genetique').textContent = formatNumber(materialPriceGenetique);

            const gstGenetique = materialPriceGenetique * GST_PERCENTAGE;
            document.getElementById('display-gst-genetique').textContent = formatNumber(gstGenetique);

            const vpcsToGenetique = materialPriceGenetique + gstGenetique;
            document.getElementById('display-vpcs-to-genetique').textContent = formatNumber(vpcsToGenetique);

            document.getElementById('display-customs-tax').textContent = '0.00'; // Not applicable
        }

    };

    modeSelector.addEventListener('change', calculateCosts);
    weightInput.addEventListener('input', calculateCosts);

    calculateCosts();
});
