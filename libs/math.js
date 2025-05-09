/**
 * Get the inverse of the standard normal cumulative distribution
 * (a distribution with a mean of zero and a standard deviation of one).
 * This gets the quantile corresponding to the input probability, which is
 * essentially the number of standard deviations from the mean.
 *
 * Relative error of this implemenation is less than 1.15 × 10−9 in the entire region.
 *
 * Based on Peter John Acklman's algorithm:
 * https://web.archive.org/web/20151030212308/http://home.online.no/~pjacklam/notes/invnorm/index.html#Other_algorithms
 *
 * @param p The input probability, a decimal number from 0 to 1
 * @returns The quantile corresponding to the input probability (standard devations)
 */
function normSinv(p) {
    var a1 = -3.969683028665376e1;
    var a2 = 2.209460984245205e2;
    var a3 = -2.759285104469687e2;
    var a4 = 1.38357751867269e2;
    var a5 = -3.066479806614716e1;
    var a6 = 2.506628277459239;
    var b1 = -5.447609879822406e1;
    var b2 = 1.615858368580409e2;
    var b3 = -1.556989798598866e2;
    var b4 = 6.680131188771972e1;
    var b5 = -1.328068155288572e1;
    var c1 = -7.784894002430293e-3;
    var c2 = -3.223964580411365e-1;
    var c3 = -2.400758277161838;
    var c4 = -2.549732539343734;
    var c5 = 4.374664141464968;
    var c6 = 2.938163982698783;
    var d1 = 7.784695709041462e-3;
    var d2 = 3.224671290700398e-1;
    var d3 = 2.445134137142996;
    var d4 = 3.754408661907416;
    var p_low = 0.02425;
    var p_high = 1 - p_low;
    var q;
    // Rational approximation for lower region
    if (0 < p && p < p_low) {
        q = Math.sqrt(-2 * Math.log(p));
        return ((((((c1 * q + c2) * q + c3) * q + c4) * q + c5) * q + c6) /
            ((((d1 * q + d2) * q + d3) * q + d4) * q + 1));
    }
    // Rational approximation for central region
    if (p_low <= p && p <= p_high) {
        q = p - 0.5;
        var r = q * q;
        return (((((((a1 * r + a2) * r + a3) * r + a4) * r + a5) * r + a6) * q) /
            (((((b1 * r + b2) * r + b3) * r + b4) * r + b5) * r + 1));
    }
    // Rational approximation for upper region
    if (p_high < p && p < 1) {
        q = Math.sqrt(-2 * Math.log(1 - p));
        return (-(((((c1 * q + c2) * q + c3) * q + c4) * q + c5) * q + c6) /
            ((((d1 * q + d2) * q + d3) * q + d4) * q + 1));
    }
    return 0;
}
export default normSinv;
