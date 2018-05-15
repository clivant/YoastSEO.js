const AssessmentResult = require( "../../values/AssessmentResult.js" );
const Assessment = require( "../../assessment.js" );
const merge = require( "lodash/merge" );
const countWords = require( "../../stringProcessing/countWords.js" );
const matchWords = require( "../../stringProcessing/matchTextWithWord.js" );
const Mark = require( "../../values/Mark.js" );
const marker = require( "../../markers/addMark.js" );

/**
 * Returns a score based on the largest percentage of text in
 * which no keyword occurs.
 */
class largestKeywordDistanceAssessment extends Assessment {
	/**
	 * Sets the identifier and the config.
	 *
	 * @param {Object} config The configuration to use.
	 *
	 * @returns {void}
	 */
	constructor( config = {} ) {
		super();

		const defaultConfig = {
			recommendedMaximumKeyWordDistance: 30,
			good: {
				score: 9,
				resultText: "Your keyword is distributed evenly throughout the text. " +
				"That's great.",
			},
			bad: {
				score: 1,
				resultText: "Some parts of your text do not contain the keyword. " +
					"Try to distribute the keyword more evenly.",
			},
		};

		this.identifier = "largestKeywordDistance";
		this._config = merge( defaultConfig, config );
	}

	/**
	 * Runs the largestKeywordDistance research and based on this returns an assessment result.
	 *
	 * @param {Paper} paper The paper to use for the assessment.
	 * @param {Researcher} researcher The researcher used for calling research.
	 * @param {Object} i18n The object used for translations.
	 *
	 * @returns {AssessmentResult} The assessment result.
	 */
	getResult( paper, researcher, i18n ) {
		const largestKeywordDistance = researcher.getResearch( "largestKeywordDistance" );
		let assessmentResult = new AssessmentResult();

		const calculatedResult = this.calculateResult( largestKeywordDistance );

		assessmentResult.setScore( calculatedResult.score );
		assessmentResult.setText( this.translateScore( calculatedResult.resultText, i18n ) );
		assessmentResult.setHasMarks( ( calculatedResult.score < 2 ) );

		return assessmentResult;
	}

	/**
	 *  Calculates the result based on the largestKeywordDistance research.
	 *
	 * @param {number} largestKeywordDistance The largest distance between two keywords or a keyword and the start/beginning of the text.
	 *
	 * @returns {Object} Object with score and feedback text.
	 */
	calculateResult( largestKeywordDistance ) {
		if ( largestKeywordDistance > this._config.recommendedMaximumKeyWordDistance ) {
			return this._config.bad;
		}

		return this._config.good;
	}

	/**
	 * Returns the score for the largest keyword distance assessment.
	 *
	 * @param {number} largestKeywordDistance The largest distance between two keywords or a keyword and the start/beginning of the text.
	 *
	 * @returns {number} The calculated score.
	 */

	/**
	 * Translates the largest keyword assessment score to a message the user can understand.
	 *
	 * @param {string} resultText The feedback text for a given value of the assessment result.
	 * @param {Object} i18n The object used for translations.
	 *
	 * @returns {string} The translated string.
	 */
	translateScore( resultText, i18n ) {
		return i18n.sprintf( i18n.dgettext( "js-text-analysis", resultText ) );
	}

	/**
	 * Creates a marker for the keyword.
	 *
	 * @param {Paper} paper The paper to use for the assessment.
	 *
	 * @returns {Array} All markers for the current text.
	 */
	getMarks( paper ) {
		const keyword = paper.getKeyword();

		return [ new Mark( {
			original: keyword,
			marked: marker( keyword ),
		} ) ];
	}

	/**
	 * Checks whether the paper has a text with at least 100 words, a keyword, and whether
	 * the keyword appears more at least twice in the text (required to calculate a distribution).
	 *
	 * @param {Paper} paper The paper to use for the assessment.
	 *
	 * @returns {boolean} True when there is a keyword and a text with 100 words or more,
	 *                    with the keyword occurring more than one time.
	 */
	isApplicable( paper ) {
		const keywordCount = matchWords( paper.getText(), paper.getKeyword(), paper.getLocale() );

		return paper.hasText() && paper.hasKeyword() && countWords( paper.getText() ) >= 200 && keywordCount > 1;
	}
}

module.exports = largestKeywordDistanceAssessment;