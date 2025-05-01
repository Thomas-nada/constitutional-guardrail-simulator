    # Cardano Constitutional Guardrail Impact Simulator

    This is a simple web-based tool designed to help users quickly check proposed values for Cardano protocol parameters against the relevant Guardrails defined in Appendix I of the Cardano Constitution.

    It allows users to select a parameter, input a value, and see the corresponding Guardrail text and a basic analysis of potential rule violations based on predefined numeric limits.

    **Live Demo:** *(Optional: If you host this tool using GitHub Pages or another service, add the link here)*

    ## How to Use

    1.  **Download:** Clone this repository or download the files (`index.html`, `style.css`, `script.js`, `constitution.js`).
    2.  **Ensure Constitution Text:** Verify that the `constitution.js` file contains the **latest and complete** official text of the Cardano Constitution, including Appendix I. This tool's accuracy depends entirely on this file being correct.
    3.  **Open:** Open the `index.html` file in your web browser (double-clicking usually works).
    4.  **Select Parameter:** Choose a protocol parameter from the dropdown menu.
    5.  **Enter Value:** Input the proposed numeric value for the parameter.
    6.  **Check:** Click the "Check Guardrails" button.
    7.  **Review Results:** The tool will display:
        * The relevant Guardrail codes and their text from Appendix I.
        * An analysis indicating potential violations (for "must" rules) or warnings based on the numeric checks implemented in `script.js`.

    ## Features

    * Dropdown selection for various Cardano protocol parameters.
    * Input field for proposed parameter values.
    * Displays relevant Guardrail text directly from the Constitution Appendix I.
    * Performs basic numeric checks (min/max values) against defined rules.
    * Highlights potential "must" violations (Red) and "should" warnings/reminders (Yellow/Orange).

    ## Limitations

    * **Incomplete Parameter Data:** The `script.js` currently contains data for only a **subset** of parameters and their rules. A full implementation requires manually adding all parameters and rules from Appendix I to the `parameterData` object in `script.js`.
    * **Constitution Updates:** The `constitution.js` file must be manually updated whenever the official Cardano Constitution changes. The tool will not automatically fetch updates.
    * **Complex Rule Checks:** Many Guardrails involve conditions beyond simple numeric limits (e.g., rate of change per epoch, comparisons between parameters, requirements for benchmarking). This tool **cannot** automatically verify these complex conditions and will only display the relevant Guardrail text as a reminder.
    * **No Contextual Awareness:** The tool only performs checks based on the explicitly defined rules in `script.js`. It does not understand the broader context or interact with the live blockchain.
    * **Not Official Advice:** This tool is for informational and quick-reference purposes only. It is **not** a substitute for careful reading of the Constitution, official documentation, or expert technical/economic analysis.

    ## Contributing *(Optional)*

    *(Add instructions here if you want others to contribute, e.g., how to report issues or suggest improvements)*

    ## License

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

        http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
    
