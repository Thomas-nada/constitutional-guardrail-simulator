// script.js

// --- Parameter Data Structure ---
// Manually extracted data for a SUBSET of parameters and their guardrails.
// A full implementation requires adding all parameters from Appendix I.
// 'rules' array helps automate checks where possible.
const parameterData = {
    // --- Critical Operation Parameters ---
    'maxBlockBodySize': {
        description: "Maximum block body size",
        unit: "Bytes",
        guardrails: ['MBBS-01', 'MBBS-02', 'MBBS-03a', 'MBBS-04', 'MBBS-05', 'MBBS-06', 'MBBS-07'],
        rules: [
            { type: 'max', value: 122880, hard: true, code: 'MBBS-01', message: "Must not exceed 122,880 Bytes (120KB)." },
            { type: 'min', value: 24576, hard: true, code: 'MBBS-02', message: "Must not be lower than 24,576 Bytes (24KB)." },
            { type: 'condition', hard: true, code: 'MBBS-03a', message: "Must not be decreased, other than in exceptional circumstances." }, // Hard to check value alone
            { type: 'condition', hard: false, code: 'MBBS-05', message: "Should be changed by at most 10,240 Bytes (10KB) per epoch." } // Cannot check epoch rate here
        ]
    },
    'maxTxSize': {
        description: "Maximum transaction size",
        unit: "Bytes",
        guardrails: ['MTS-01', 'MTS-02', 'MTS-03', 'MTS-04', 'MTS-05', 'MTS-06'],
        rules: [
            { type: 'max', value: 32768, hard: true, code: 'MTS-01', message: "Must not exceed 32,768 Bytes (32KB)." },
            { type: 'min', value: 0, hard: true, code: 'MTS-02', message: "Must not be negative." }, // Technically >= 0
            { type: 'condition', hard: true, code: 'MTS-03', message: "Must not be decreased." }, // Hard to check value alone
            { type: 'condition', hard: false, code: 'MTS-05', message: "Should not be increased by more than 2,560 Bytes (2.5KB) in any epoch." }, // Cannot check epoch rate
            { type: 'condition', hard: false, code: 'MTS-06', message: "Should not exceed 1/4 of the block size." } // Requires current block size
        ]
    },
     'txFeePerByte': {
        description: "Transaction fee per byte",
        unit: "Lovelace",
        guardrails: ['TFPB-01', 'TFPB-02', 'TFPB-03', 'TFGEN-01', 'TFGEN-02'],
        rules: [
            { type: 'min', value: 30, hard: true, code: 'TFPB-01', message: "Must not be lower than 30 lovelace." },
            { type: 'max', value: 1000, hard: true, code: 'TFPB-02', message: "Must not exceed 1,000 lovelace." },
            { type: 'min', value: 0, hard: true, code: 'TFPB-03', message: "Must not be negative." } // Redundant given TFPB-01 but explicit in text
        ]
    },
     'txFeeFixed': {
        description: "Fixed transaction fee",
        unit: "Lovelace",
        guardrails: ['TFF-01', 'TFF-02', 'TFF-03', 'TFGEN-01', 'TFGEN-02'],
        rules: [
            { type: 'min', value: 100000, hard: true, code: 'TFF-01', message: "Must not be lower than 100,000 lovelace (0.1 ada)." },
            { type: 'max', value: 10000000, hard: true, code: 'TFF-02', message: "Must not exceed 10,000,000 lovelace (10 ada)." },
            { type: 'min', value: 0, hard: true, code: 'TFF-03', message: "Must not be negative." } // Redundant given TFF-01
        ]
    },
    // --- Critical Governance Parameters ---
    'stakeAddressDeposit': {
        description: "Stake address deposit",
        unit: "Lovelace",
        guardrails: ['SAD-01', 'SAD-02', 'SAD-03'],
        rules: [
            { type: 'min', value: 1000000, hard: true, code: 'SAD-01', message: "Must not be lower than 1,000,000 lovelace (1 ada)." },
            { type: 'max', value: 5000000, hard: true, code: 'SAD-02', message: "Must not exceed 5,000,000 lovelace (5 ada)." },
            { type: 'min', value: 0, hard: true, code: 'SAD-03', message: "Must not be negative." }
        ]
    },
    'stakePoolDeposit': {
        description: "Stake pool deposit",
        unit: "Lovelace",
        guardrails: ['SPD-01', 'SPD-02', 'SPD-03'],
        rules: [
            { type: 'min', value: 250000000, hard: true, code: 'SPD-01', message: "Must not be lower than 250,000,000 lovelace (250 ada)." },
            { type: 'max', value: 500000000, hard: true, code: 'SPD-02', message: "Must not exceed 500,000,000 lovelace (500 ada)." },
            { type: 'min', value: 0, hard: true, code: 'SPD-03', message: "Must not be negative." }
        ]
    },
    'committeeMinSize': {
        description: "Minimum Constitutional Committee size",
        unit: "Members",
        guardrails: ['CMS-01', 'CMS-02', 'CMS-03'],
         rules: [
            { type: 'min', value: 3, hard: true, code: 'CMS-02', message: "Must not be lower than 3." },
            { type: 'max', value: 10, hard: true, code: 'CMS-03', message: "Must not exceed 10." },
            { type: 'min', value: 0, hard: true, code: 'CMS-01', message: "Must not be negative." } // Redundant given CMS-02
        ]
    },
    'committeeMaxTermLength': {
        description: "Maximum Constitutional Committee term length",
        unit: "Epochs",
        guardrails: ['CMTL-01a', 'CMTL-02a', 'CMTL-03a', 'CMTL-04a', 'CMTL-05a'],
        rules: [
            { type: 'min', value: 18, hard: true, code: 'CMTL-03a', message: "Must not be lower than 18 epochs (approx 3 months)." },
            { type: 'max', value: 293, hard: true, code: 'CMTL-04a', message: "Must not exceed 293 epochs (approx 4 years)." },
            { type: 'condition', hard: false, code: 'CMTL-05a', message: "Should not exceed 220 epochs (approx 3 years)." },
            // CMTL-01a (not zero) and CMTL-02a (not negative) are covered by the 'min' rule check
        ]
    },
    // --- Economic Parameters ---
     'treasuryCut': {
        description: "Treasury cut from rewards",
        unit: "% (as decimal)",
        guardrails: ['TC-01', 'TC-02', 'TC-03', 'TC-04', 'TC-05'],
        rules: [
            { type: 'min', value: 0.1, hard: true, code: 'TC-01', message: "Must not be lower than 0.1 (10%)." },
            { type: 'max', value: 0.3, hard: true, code: 'TC-02', message: "Must not exceed 0.3 (30%)." },
            { type: 'min', value: 0, hard: true, code: 'TC-03', message: "Must not be negative." }, // Redundant
            { type: 'max', value: 1.0, hard: true, code: 'TC-04', message: "Must not exceed 1.0 (100%)." }, // Redundant
            { type: 'condition', hard: true, code: 'TC-05', message: "Must not be changed more than once in any 36 epoch period." } // Cannot check here
        ]
    },
    // --- Network Parameters ---
    // (Add more like maxBlockExecutionUnits, maxTxExecutionUnits etc. if needed)

    // --- Technical/Security Parameters ---
    'stakePoolTargetNum': {
        description: "Target number of stake pools (k)",
        unit: "Pools",
        guardrails: ['SPTN-01', 'SPTN-02', 'SPTN-03', 'SPTN-04'],
        rules: [
            { type: 'min', value: 250, hard: true, code: 'SPTN-01', message: "Must not be lower than 250." },
            { type: 'max', value: 2000, hard: true, code: 'SPTN-02', message: "Must not exceed 2,000." },
            { type: 'notEqual', value: 0, hard: true, code: 'SPTN-04', message: "Must not be zero." },
            { type: 'min', value: 0, hard: true, code: 'SPTN-03', message: "Must not be negative." } // Covered by min and notEqual check
        ]
    },
    'poolPledgeInfluence': {
        description: "Pledge influence factor (a0)",
        unit: "Factor (decimal)",
        guardrails: ['PPI-01', 'PPI-02', 'PPI-03', 'PPI-04'],
        rules: [
            { type: 'min', value: 0.1, hard: true, code: 'PPI-01', message: "Must not be lower than 0.1." },
            { type: 'max', value: 1.0, hard: true, code: 'PPI-02', message: "Must not exceed 1.0." },
            { type: 'min', value: 0, hard: true, code: 'PPI-03', message: "Must not be negative." }, // Redundant
            { type: 'condition', hard: false, code: 'PPI-04', message: "Should not vary by more than +/-10% in any 18-epoch period." } // Cannot check here
        ]
    },
    // --- Governance Parameters ---
    'govActionLifetime': {
        description: "Governance action lifetime",
        unit: "Epochs",
        guardrails: ['GAL-01', 'GAL-03', 'GAL-02', 'GAL-04', 'GAL-05'],
        rules: [
            { type: 'min', value: 1, hard: true, code: 'GAL-01', message: "Must not be lower than 1 epoch (5 days)." },
            { type: 'min', value: 2, hard: false, code: 'GAL-03', message: "Should not be lower than 2 epochs (10 days)." },
            { type: 'max', value: 15, hard: true, code: 'GAL-02', message: "Must not exceed 15 epochs (75 days)." },
            { type: 'condition', hard: true, code: 'GAL-05', message: "Must be less than dRepActivity." } // Requires dRepActivity value
        ]
    },
    // Add more parameters here...
};

console.log("Script loaded."); // DEBUG

// --- Get HTML Elements ---
const parameterSelect = document.getElementById('parameterSelect');
const parameterValueInput = document.getElementById('parameterValue');
const parameterUnitSpan = document.getElementById('parameterUnit');
const checkButton = document.getElementById('checkButton');
const resultsDiv = document.getElementById('results');

// DEBUG: Check if elements are found
console.log("parameterSelect element:", parameterSelect);
console.log("checkButton element:", checkButton);
console.log("resultsDiv element:", resultsDiv);

// --- Functions ---

/**
 * Populates the dropdown menu with parameter names.
 */
function populateParameterDropdown() {
    console.log("Running populateParameterDropdown..."); // DEBUG
    // DEBUG: Check parameterData object
    if (!parameterData || Object.keys(parameterData).length === 0) {
        console.error("parameterData is empty or undefined!");
        return;
    }
     // DEBUG: Check if parameterSelect element exists before proceeding
     if (!parameterSelect) {
         console.error("parameterSelect element not found in populateParameterDropdown!");
         return;
     }

    const parameters = Object.keys(parameterData).sort(); // Get sorted parameter names
    console.log("Parameters found:", parameters); // DEBUG

    parameters.forEach((paramKey, index) => {
        // DEBUG: Log each parameter being added
        console.log(`Adding option ${index + 1}: ${paramKey}`);
        try {
            const option = document.createElement('option');
            option.value = paramKey;
            // Use the description for display, fallback to the key
            option.textContent = parameterData[paramKey]?.description || paramKey; // Use optional chaining
            parameterSelect.appendChild(option);
        } catch (error) {
            console.error(`Error adding option for ${paramKey}:`, error); // DEBUG error in loop
        }
    });
    console.log("Finished populateParameterDropdown."); // DEBUG
}

/**
 * Finds the full text of a specific Guardrail code within the constitution text.
 * @param {string} guardrailCode - The code to search for (e.g., "MBBS-01").
 * @returns {string|null} - The full line containing the Guardrail text, or null if not found.
 */
function findGuardrailText(guardrailCode) {
    // Check if constitution text is available
    if (typeof constitutionText === 'undefined' || !constitutionText || !guardrailCode) {
        console.error("constitutionText is not available in findGuardrailText");
        return `Error: Constitution text not loaded.`;
    }


    // Escape the code in case it contains regex special chars (like '-')
    const escapedCode = guardrailCode.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    // Regex to find the line starting with the Guardrail code, including the marker (y/x/~)
    const regex = new RegExp(`^\\s*${escapedCode}\\s*\\([yx~][^)]*\\)\\s*(.*)$`, 'im'); // i=insensitive, m=multiline
    const match = constitutionText.match(regex);

    if (match) {
        // Attempt to return the full matched line for context
        const fullLineMatch = constitutionText.match(new RegExp(`^.*${escapedCode}.*$`, 'im'));
        return fullLineMatch ? fullLineMatch[0].trim() : `Text for ${guardrailCode} found but couldn't extract full line.`;
    } else {
        // Fallback: Simpler search if the specific format fails
        console.warn(`Could not precisely find text for Guardrail using specific format: ${guardrailCode}. Trying broader search.`);
        const simpleRegex = new RegExp(`^.*${escapedCode}.*$`, 'im');
        const simpleMatch = constitutionText.match(simpleRegex);
        if (simpleMatch) {
             const line = simpleMatch[0].trim();
             // Basic check if the code appears near the start
             if (line.toLowerCase().indexOf(guardrailCode.toLowerCase()) < 20) { // Allow slightly more offset
                 return line;
             } else {
                 console.warn(`Found line for ${guardrailCode}, but code not near start: "${line}"`);
                 return `Text for ${guardrailCode} found, but context might be inaccurate. Please check Appendix I.`;
             }
        }
        console.error(`Could not find any line containing Guardrail: ${guardrailCode}`);
        return `Text for ${guardrailCode} could not be found. Please check Appendix I manually.`;
    }
}


/**
 * Checks the input value against the defined rules for the selected parameter.
 * @param {string} paramKey - The key of the selected parameter.
 * @param {string} inputValueStr - The value entered by the user.
 * @returns {string} - HTML string containing violation/warning messages.
 */
function checkValueAgainstRules(paramKey, inputValueStr) {
    const paramInfo = parameterData[paramKey];
    // Check if rules exist for this parameter
    if (!paramInfo || !paramInfo.rules || inputValueStr.trim() === '') {
        return '<p class="no-check">No value entered or no specific rules defined for automated checking.</p>';
    }

    // Convert input to a number
    const value = Number(inputValueStr);
    // Check if conversion failed (input was not a valid number)
    if (isNaN(value)) {
        // Allow specific non-numeric parameters if needed in the future
        // if (paramKey === 'someNonNumericParam') { ... }
        return '<p class="warning">Invalid input: Please enter a numeric value.</p>';
    }

    let analysisHtml = '<h3>Value Analysis:</h3>';
    let violations = 0;
    let warnings = 0;

    // Iterate through each rule defined for this parameter
    paramInfo.rules.forEach(rule => {
        let violated = false;
        // Use the specific message from the rule, or create a default
        let message = rule.message || `Rule condition for ${rule.code}`;

        // Evaluate based on the rule type
        switch (rule.type) {
            case 'min':
                if (value < rule.value) violated = true;
                break;
            case 'max':
                if (value > rule.value) violated = true;
                break;
            case 'notEqual':
                // Use == for comparison to handle potential type differences (e.g., 0 vs "0")
                // eslint-disable-next-line eqeqeq
                if (value == rule.value) violated = true;
                break;
            case 'condition':
                // These are conditions that *cannot* be easily checked automatically here.
                // Display them as non-blocking reminders/notes.
                 if (rule.hard) { // e.g., "Must not be decreased"
                     analysisHtml += `<p class="info">Reminder (${rule.code}): ${message}</p>`;
                 } else { // e.g., "Should be changed by at most X per epoch"
                     analysisHtml += `<p class="warning">Note (${rule.code}): ${message}</p>`;
                 }
                 // Skip adding to violation/warning counts for these reminders.
                 return; // Continue to the next rule using 'return' inside forEach
            // Add more rule types here if needed (e.g., 'enum', 'pattern')
            default:
                 console.warn(`Unknown rule type "${rule.type}" for parameter ${paramKey}`);
                 return; // Skip unknown rule types
        }

        // Add violation or warning message based on rule hardness
        if (violated && rule.hard) { // Hard rule ("must") violated
            analysisHtml += `<p class="violation">Violation (${rule.code}): ${message}</p>`;
            violations++;
        } else if (violated && !rule.hard) { // Soft rule ("should") violated
            analysisHtml += `<p class="warning">Warning (${rule.code}): ${message}</p>`;
            warnings++;
        }
    });

    // Add summary message if no issues were found *and* no reminders were added
    if (violations === 0 && warnings === 0 && analysisHtml === '<h3>Value Analysis:</h3>') {
        analysisHtml += '<p class="info">Input value appears consistent with defined numeric Guardrail limits.</p>';
    }
     // Update the heading with counts if there were issues
     if (violations > 0) {
         analysisHtml = `<h3>Value Analysis: <span style="color: #dc3545;">(${violations} Violation${violations > 1 ? 's' : ''})</span></h3>` + analysisHtml.substring(analysisHtml.indexOf(':</h3>')+6);
     } else if (warnings > 0) {
         analysisHtml = `<h3>Value Analysis: <span style="color: #856404;">(${warnings} Warning${warnings > 1 ? 's' : ''})</span></h3>` + analysisHtml.substring(analysisHtml.indexOf(':</h3>')+6);
     }


    return analysisHtml;
}


/**
 * Main function triggered by the button click.
 */
function performCheck() {
    console.log("Check button clicked."); // DEBUG
    const selectedParamKey = parameterSelect.value;
    const inputValue = parameterValueInput.value;
    resultsDiv.innerHTML = ''; // Clear previous results

    if (!selectedParamKey) {
        resultsDiv.innerHTML = '<p class="warning">Please select a parameter first.</p>';
        return;
    }
    console.log(`Parameter selected: ${selectedParamKey}, Value: ${inputValue}`); // DEBUG

    const paramInfo = parameterData[selectedParamKey];
    if (!paramInfo) {
        resultsDiv.innerHTML = '<p class="violation">Error: Parameter data not found.</p>';
        console.error(`Parameter data not found for key: ${selectedParamKey}`); // DEBUG
        return;
    }

    let resultsHtml = `<h2>${paramInfo.description || selectedParamKey}</h2>`;
    resultsHtml += '<h3>Relevant Guardrails:</h3>';

    if (paramInfo.guardrails && paramInfo.guardrails.length > 0) {
        paramInfo.guardrails.forEach(code => {
            const fullText = findGuardrailText(code);
            let itemClass = 'guardrail-item';
            // Check if the found text contains 'must' or 'should' for styling
            if (fullText && fullText.toLowerCase().includes('must')) {
                itemClass += ' requirement';
            } else if (fullText && fullText.toLowerCase().includes('should')) {
                 itemClass += ' recommendation';
            }
            // Extract only the text after the marker like (y) or (x)
            const textOnly = fullText ? fullText.substring(fullText.indexOf(')') + 1).trim() : 'Full text not found.';
            // Display the code (strong) and the extracted text
            resultsHtml += `<div class="${itemClass}"><strong>${code}</strong> ${textOnly}</div>`;
        });
    } else {
        resultsHtml += '<p>No specific Guardrail codes listed for this parameter in the data.</p>';
    }

    // Add the value analysis section
    resultsHtml += '<div class="analysis-section">';
    resultsHtml += checkValueAgainstRules(selectedParamKey, inputValue);
    resultsHtml += '</div>';


    resultsDiv.innerHTML = resultsHtml;
    console.log("Results displayed."); // DEBUG
}

/**
 * Updates the unit display when a parameter is selected.
 */
function updateUnitDisplay() {
     const selectedParamKey = parameterSelect.value;
     if (selectedParamKey && parameterData[selectedParamKey] && parameterData[selectedParamKey].unit) {
         parameterUnitSpan.textContent = parameterData[selectedParamKey].unit;
     } else {
          parameterUnitSpan.textContent = '';
     }
     console.log(`Unit display updated for ${selectedParamKey}`); // DEBUG
}

// --- Initialization ---
// Moved initialization logic into a DOMContentLoaded listener
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM fully loaded and parsed."); // DEBUG

    // Re-get elements inside the listener just in case
    const localParameterSelect = document.getElementById('parameterSelect');
    const localCheckButton = document.getElementById('checkButton');

    if (!localParameterSelect) {
        console.error("Failed to find parameterSelect element on DOMContentLoaded!");
        return;
    }
     if (!localCheckButton) {
        console.error("Failed to find checkButton element on DOMContentLoaded!");
        // Continue if button missing, but log error
    }


    // Initial check for constitution text
    if (typeof constitutionText === 'undefined' || !constitutionText.trim()) {
        console.error("Constitution text from constitution.js seems empty or not loaded!");
        if(resultsDiv) resultsDiv.innerHTML = '<p class="violation"><strong>Error:</strong> Could not load constitution text! Please ensure constitution.js is present and correct.</p>';
    } else {
        console.log("Constitution text loaded successfully."); // DEBUG
    }

    // Populate dropdown
    populateParameterDropdown();

    // Add event listeners
    if(localCheckButton) localCheckButton.addEventListener('click', performCheck);
    localParameterSelect.addEventListener('change', updateUnitDisplay);

    console.log("Initialization complete."); // DEBUG
});

console.log("End of script execution."); // DEBUG
