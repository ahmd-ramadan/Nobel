import { IModelPoint, IPointData } from "../interfaces";
import { ApiError } from "./apiError";
import { INTERNAL_SERVER_ERROR } from "./statusCodes";

export interface ICoffes {
    a: number,
    b: number,
    c: number
}

export const generateInterpolatedEfficiency = (index: number, validPoints: IModelPoint[]) => {
    // Default efficiency values in case we don't have enough input data
    const defaultEfficiencies = [65, 70, 72, 70, 63];
    
    let efficiencies = [];
    
    // If we have valid points with efficiency values, use those
    if (validPoints && validPoints.length >= 2) {
      efficiencies = validPoints.map(point => 
        point.efficiency || 65
      );
    } else {
      // Otherwise use the default values
      efficiencies = defaultEfficiencies;
    }
    
    const displayIndex = index + 1;
    const keyPoints = [1, 250, 500, 750, 1000];
    
    // Check if this display index is a key point
    const keyPointIndex = keyPoints.indexOf(displayIndex);
    if (keyPointIndex !== -1 && keyPointIndex < efficiencies.length) {
      return efficiencies[keyPointIndex] //.toFixed(4);
    }
    
    // Find which segment this index belongs to
    let segment = 0;
    for (let i = 1; i < keyPoints.length; i++) {
      if (displayIndex < keyPoints[i]) {
        segment = i - 1;
        break;
      }
    }
    
    // Get the start and end points for this segment
    const startIndex = keyPoints[segment];
    const endIndex = keyPoints[segment + 1];
    const startValue = efficiencies[segment];
    const endValue = efficiencies[segment + 1];
    
    // Calculate progress through the segment with enhanced smoothing
    const progress = (displayIndex - startIndex) / (endIndex - startIndex);
    
    // Calculate interpolated efficiency with additional smoothing
    const interpolatedValue = startValue + (endValue - startValue) * progress;
    
    return interpolatedValue //.toFixed(4);
};

// ===== MATHEMATICAL CALCULATIONS =====
export const calculateQuadraticCoefficients = (points: IModelPoint[]) => {
    // Get points 1, 3, and 5 (0-based index: 0, 2, 4)
    const point1 = points[0];
    const point3 = points[2];
    const point5 = points[4];

    // Extract x (flowRate) and y (totalPressure) values
    const x1 = point1.flowRate;
    const y1 = point1.totalPressure;
    const x3 = point3.flowRate;
    const y3 = point3.totalPressure;
    const x5 = point5.flowRate;
    const y5 = point5.totalPressure;

    // Calculate coefficients using the three points
    // Using the system of equations:
    // y1 = ax1² + bx1 + c
    // y3 = ax3² + bx3 + c
    // y5 = ax5² + bx5 + c

    // Calculate determinants
    const det = (x1 * x1 * x3) + (x3 * x3 * x5) + (x5 * x5 * x1) - 
                (x1 * x3 * x3) - (x3 * x5 * x5) - (x5 * x1 * x1);

    const detA = (y1 * x3) + (y3 * x5) + (y5 * x1) - 
                    (x1 * y3) - (x3 * y5) - (x5 * y1);

    const detB = (x1 * x1 * y3) + (x3 * x3 * y5) + (x5 * x5 * y1) - 
                    (y1 * x3 * x3) - (y3 * x5 * x5) - (y5 * x1 * x1);

    const detC = (x1 * x1 * x3 * y5) + (x3 * x3 * x5 * y1) + (x5 * x5 * x1 * y3) - 
                    (y1 * x3 * x5 * x5) - (y3 * x5 * x1 * x1) - (y5 * x1 * x3 * x3);

    // Calculate coefficients
    const a = detA / det;
    const b = detB / det;
    const c = detC / det;

    return { a, b, c };
};

export const calculateDiameter = (model: number) => {
    try {
        if (model) {
            // Convert to number and divide by 1000
            const diameterValue = model / 1000;
            
            // Dispatch to Redux
            // dispatch(setDiameter(diameterValue));
            
            console.log('diameter', diameterValue);
            
            return diameterValue;
        }
        // Dispatch default value to Redux
        // dispatch(setDiameter(0.63));
        return 0.63; // Default value if no numbers found
    } catch (error) {
        // throw new ApiError(`Error calculating diameter: ${error}`, INTERNAL_SERVER_ERROR);
        // Dispatch default value to Redux
        // dispatch(setDiameter(0.63));
        return 0.63; // Default value if error occurs
    }
};

// ===== POINT GENERATION FUNCTIONS =====
// # Generate 1000 points
export const generatePoints = (coeffs: ICoffes, basePoints: IModelPoint[], diameter: number) => {
    const validPoints = basePoints.filter(point => 
        point.flowRate && point.totalPressure && point.efficiency
    );

    if (validPoints.length < 2) return [];

    const sortedPoints = [...validPoints].sort((a, b) => 
        a.flowRate - b.flowRate
    );

    const firstPoint = sortedPoints[0];
    const lastPoint = sortedPoints[sortedPoints.length - 1];


    const rpm = firstPoint.rpm ;

    const PI = Math.PI;
    const DIAMETER_SQUARED = diameter * diameter;
    const VELOCITY_CONSTANT = 4 / (PI * DIAMETER_SQUARED);

    const generatedPoints = [];

    const keyPoints = [
        { index: 0, flowRate: firstPoint.flowRate, totalPressure: firstPoint.totalPressure, efficiency: firstPoint.efficiency },
        { index: 249, flowRate: sortedPoints[1].flowRate, totalPressure: sortedPoints[1].totalPressure, efficiency: sortedPoints[1].efficiency },
        { index: 499, flowRate: sortedPoints[2].flowRate, totalPressure: sortedPoints[2].totalPressure, efficiency: sortedPoints[2].efficiency },
        { index: 749, flowRate: sortedPoints[3].flowRate, totalPressure: sortedPoints[3].totalPressure, efficiency: sortedPoints[3].efficiency },
        { index: 999, flowRate: lastPoint.flowRate, totalPressure: lastPoint.totalPressure, efficiency: lastPoint.efficiency }
    ];

    const calculateFlowRate = (index: number) => {
        let segment = 0;
        for (let i = 1; i < keyPoints.length; i++) {
        if (index < keyPoints[i].index) {
            segment = i - 1;
            break;
        }
        }

        const startPoint = keyPoints[segment];
        const endPoint = keyPoints[segment + 1];
        const segmentLength = endPoint.index - startPoint.index;
        const progress = (index - startPoint.index) / segmentLength;
        
        const flowRate = startPoint.flowRate + (endPoint.flowRate - startPoint.flowRate) * progress;
        
        return Number(flowRate.toFixed(6));
    };

    const calculatePressure = (flowRate: number) => {
        const totalPressure = (coeffs.a * flowRate * flowRate) + 
                            (coeffs.b * flowRate) + 
                            coeffs.c;

        return Number(totalPressure.toFixed(6));
    };

    const calculateBrakePower = (flowRate: number, totalPressure: number, efficiency: number) => {
        const flowRateNum = Number(flowRate);
        const totalPressureNum = Number(totalPressure);
        const efficiencyDecimal = Number(efficiency) / 100;
        
        const brakePower = (flowRateNum * totalPressureNum) / (efficiencyDecimal * 1000);
        
        return Number(brakePower.toFixed(6));
    };

    // Calculate cubic coefficients for LPA using points 1,2,4,5 (indices 0,1,3,4)
    const calculateCubicCoefficientsForLpa = (points: IModelPoint[]) => {
        try {
            const indices = [0, 1, 3, 4];
            const selected = indices.map(i => points[i]);
            if (selected.some(p => !p)) return null;

            const xs = selected.map(p => p.flowRate);
            const ys = selected.map(p => p.lpa);
            if (xs.some(x => isNaN(x)) || ys.some(y => isNaN(y))) return null;

            const A = xs.map(x => [Math.pow(x, 3), Math.pow(x, 2), x, 1]);
            const solution = solveLinearSystem4x4(A, ys);
            if (!solution) return null;
            const [a, b, c, d] = solution;
            return { a, b, c, d };
        } catch (err) {
            console.error('Error calculating cubic coefficients for LPA:', err);
            return null;
        }
    };

    const evaluateCubic = (coeffs: any, x: number) => {
        if (!coeffs) return 0;
        const { a, b, c, d } = coeffs;
        return (a * x * x * x) + (b * x * x) + (c * x) + d;
    };

    // Solve a 4x4 linear system A*x = b using Gaussian elimination with partial pivoting
    const solveLinearSystem4x4 = (A: number[][], b: number[]) => {
        const n = 4;
        // Create augmented matrix
        const M = A.map((row, i) => [...row, b[i]]);

        for (let col = 0; col < n; col++) {
            // Pivot
            let pivotRow = col;
            for (let r = col + 1; r < n; r++) {
                if (Math.abs(M[r][col]) > Math.abs(M[pivotRow][col])) pivotRow = r;
            }
            if (Math.abs(M[pivotRow][col]) < 1e-12) {
                return null; // Singular
            }
            if (pivotRow !== col) {
                const tmp = M[col];
                M[col] = M[pivotRow];
                M[pivotRow] = tmp;
            }
            // Normalize pivot row
            const pivot = M[col][col];
            for (let c = col; c <= n; c++) M[col][c] /= pivot;
            // Eliminate others
            for (let r = 0; r < n; r++) {
                if (r === col) continue;
                const factor = M[r][col];
                for (let c = col; c <= n; c++) {
                    M[r][c] -= factor * M[col][c];
                }
            }
        }

        // Extract solution
        return [M[0][n], M[1][n], M[2][n], M[3][n]];
    };

    // Solve a generic n x n linear system A*x = b using Gaussian elimination with partial pivoting
    const solveLinearSystem = (A: number[][], b: number[]) => {
        try {
            const n = A.length;
            const M = A.map((row, i) => [...row, b[i]]);

            for (let col = 0; col < n; col++) {
                let pivotRow = col;
                for (let r = col + 1; r < n; r++) {
                    if (Math.abs(M[r][col]) > Math.abs(M[pivotRow][col])) pivotRow = r;
                }
                if (Math.abs(M[pivotRow][col]) < 1e-12) return null;
                if (pivotRow !== col) {
                    const tmp = M[col];
                    M[col] = M[pivotRow];
                    M[pivotRow] = tmp;
                }
                const pivot = M[col][col];
                for (let c = col; c <= n; c++) M[col][c] /= pivot;
                for (let r = 0; r < n; r++) {
                    if (r === col) continue;
                    const factor = M[r][col];
                    for (let c = col; c <= n; c++) {
                        M[r][c] -= factor * M[col][c];
                    }
                }
            }
            return M.map(row => row[n]);
        } catch (err) {
            console.error('Error solving linear system:', err);
            return null;
        }
    };

    // Calculate polynomial coefficients (degree 5) for efficiency vs flowRate using ridge regularization
    const calculatePolynomialCoefficientsForEfficiency = (points: IModelPoint[], degree = 5, ridgeLambda = 1e-6) => {
        try {
            const valid = points
                .filter(p => p && p.flowRate && p.efficiency)
                .map(p => ({ x: p.flowRate, y: p.efficiency }))
                .filter(p => !isNaN(p.x) && !isNaN(p.y));

            if (valid.length < 3) return null;

            const m = valid.length;
            const n = degree + 1; // number of coefficients

            // Build design matrix X (rows: m, cols: n) with powers from degree -> 0
            const X = valid.map(({ x }) => {
                const row = [];
                for (let d = degree; d >= 0; d--) {
                    row.push(Math.pow(x, d));
                }
                return row;
            });
            const Y = valid.map(({ y }) => y);

            // Compute XtX and XtY
            const XtX = Array.from({ length: n }, () => Array(n).fill(0));
            const XtY = Array(n).fill(0);
            for (let i = 0; i < m; i++) {
                for (let r = 0; r < n; r++) {
                    XtY[r] += X[i][r] * Y[i];
                    for (let c = 0; c < n; c++) {
                        XtX[r][c] += X[i][r] * X[i][c];
                    }
                }
            }

            // Ridge regularization to ensure invertibility when m < n
            for (let d = 0; d < n; d++) {
                XtX[d][d] += ridgeLambda;
            }

            const coeffs = solveLinearSystem(XtX, XtY);
            if (!coeffs) return null;
            return coeffs; // ordered as [x^degree, ..., 1]
        } catch (err) {
            console.error('Error calculating polynomial coefficients for efficiency:', err);
            return null;
        }
    };

    const evaluatePolynomial = (coeffs: number[], x: number) => {
        if (!coeffs) return 0;
        let y = 0;
        const n = coeffs.length;
        for (let i = 0; i < n; i++) {
            const power = n - 1 - i;
            y += coeffs[i] * Math.pow(x, power);
        }
        return y;
    };


    // Prepare cubic coefficients for LPA using points 1,2,4,5
    const cubicCoeffsLpa = calculateCubicCoefficientsForLpa(basePoints);

    // Prepare quintic polynomial for efficiency vs flowRate
    const quinticEffCoeffs = calculatePolynomialCoefficientsForEfficiency(basePoints, 5, 1e-6);

    for (let i = 0; i < 1000; i++) {
        let flowRate, totalPressure, efficiency;

        const keyPoint = keyPoints.find(kp => kp.index === i);
        if (keyPoint) {
            flowRate = keyPoint.flowRate;
            totalPressure = keyPoint.totalPressure;
            // Even at key points, evaluate via quintic to ensure smooth curve; fallback to entered value if unavailable
            if (quinticEffCoeffs) {
                efficiency = evaluatePolynomial(quinticEffCoeffs, flowRate);
            } else {
                efficiency = keyPoint.efficiency;
            }
        } else {
            flowRate = calculateFlowRate(i);
            totalPressure = calculatePressure(flowRate);
            if (quinticEffCoeffs) {
                efficiency = evaluatePolynomial(quinticEffCoeffs, flowRate);
            } else {
                efficiency = generateInterpolatedEfficiency(i, sortedPoints);
            }
        }
        
        // Clamp and format efficiency
        if (!isFinite(efficiency)) efficiency = 0;
        efficiency = Math.max(0, Math.min(100, Number(efficiency)));
        
        const velocity = VELOCITY_CONSTANT * flowRate;
        const brakePower = calculateBrakePower(flowRate, totalPressure, efficiency);
        const lpaValue = evaluateCubic(cubicCoeffsLpa, flowRate);
        
        generatedPoints.push({
            flowRate: flowRate,
            totalPressure: totalPressure,
            velocity: velocity,
            efficiency: efficiency,
            brakePower: brakePower,
            lpa: Number(lpaValue ?? 0)
        });
    }

    return generatedPoints;
};

export const generateNextRpmPoints = (basePoints: IPointData[], currentRpm: number, newRpm: number, diameter: number) => {
    const rpmRatio = newRpm / currentRpm;
    const pressureRatio = Math.pow(rpmRatio, 2);

    const newPoints = [];
    const velocityConstant = 4 / (Math.PI * Math.pow(diameter, 2));
    const lpaDelta = 50 * Math.log10(rpmRatio);

    // Apply scaling laws to each of the 1000 base points
    for (let i = 0; i < 1000; i++) {
        const basePoint = basePoints[i];
        
        // Apply scaling laws
        const flowRate = basePoint.flowRate * rpmRatio;
        const totalPressure = basePoint.totalPressure * pressureRatio;
        const efficiency = basePoint.efficiency;
        const z = basePoint.lpa || 0;
        
        // Calculate velocity using the scaled flow rate
        const velocity = flowRate * velocityConstant;
        
        // Calculate brake power using the scaled values
        const efficiencyDecimal = efficiency / 100;
        const brakePower = (flowRate * totalPressure) / (efficiencyDecimal * 1000);
        
        // Calculate LPA using provided relation with base RPM
        const lpa = z + lpaDelta;
        
        newPoints.push({
            flowRate: Number(flowRate),
            totalPressure: Number(totalPressure),
            velocity: Number(velocity),
            efficiency: Number(efficiency),
            brakePower: Number(brakePower),
            lpa: Number(lpa)
        });
    }

    return newPoints;
};

// ===== EVENT HANDLERS =====
// # First Rpm Points
export const calculateFirstRpm = (dataPoints: IModelPoint[], startRpmNumber: number, diameter: number) => {
    
    const validPoints = dataPoints.filter(point => 
        point.flowRate && point.totalPressure
    );
    
    if (validPoints.length >= 2) {
    
        // Calculate coefficients automatically using points 1, 3, and 5
        const coeffs = calculateQuadraticCoefficients(dataPoints);
    
        // // Display Quadratic Equation in console
        // console.log('Quadratic Equation:');
        // console.log(`y = ${coeffs.a.toFixed(2)}x² + ${coeffs.b.toFixed(2)}x + ${coeffs.c.toFixed(2)}`);
        // console.log('Where:');
        // console.log('y = Total Pressure');
        // console.log('x = Flow Rate');
        // console.log('\nPoints used for calculation:');
        // console.log(`Point 1: (${dataPoints[0].flowRate}, ${dataPoints[0].totalPressure})`);
        // console.log(`Point 3: (${dataPoints[2].flowRate}, ${dataPoints[2].totalPressure})`);
        // console.log(`Point 5: (${dataPoints[4].flowRate}, ${dataPoints[4].totalPressure})`);
    
        const points = generatePoints(coeffs, dataPoints, diameter);

        // const currentRpm = validPoints[0].rpm || startRpmNumber;
        
        return points;
    } else {
        throw new ApiError('Please enter at least 2 valid data points with flowRate and totalPressure values.', INTERNAL_SERVER_ERROR);
    }
};

// export const handleGenerateNextRpm = (nextRpm: number, calculatedPoints: IPointData[], currentRpm: number, diameter: number) => {
export const handleGenerateNextRpm = (calculatedPoints: IPointData[], currentRpm: number, nextRpm: number, diameter: number) => {
    if (!nextRpm || calculatedPoints.length === 0) {
        throw new ApiError('Please enter a valid RPM value and ensure base points are calculated first.', INTERNAL_SERVER_ERROR);
    }
    
    const targetRpm = nextRpm;
    
    if (isNaN(targetRpm) || targetRpm <= 0) {
        throw new ApiError('Please enter a valid positive number for RPM.', INTERNAL_SERVER_ERROR);
    }

    if (targetRpm <= currentRpm) {
        throw new ApiError('Please enter an RPM value greater than the current RPM: ' + currentRpm, INTERNAL_SERVER_ERROR);
    }

    if (targetRpm < 250 || targetRpm > 3750) {
        throw new ApiError('RPM must be between 250 and 3750.', INTERNAL_SERVER_ERROR);
    }

    return generateNextRpmPoints(calculatedPoints, currentRpm, nextRpm, diameter);
    
    // const allPoints = { [currentRpm]: calculatedPoints };
    // let allGeneratedData = [...calculatedPoints];
    
    // for (let rpm = currentRpm + 1; rpm <= targetRpm; rpm++) {
    //     const rpmPoints = generateNextRpmPoints(calculatedPoints, currentRpm, rpm, diameter);
    //     // allPoints[rpm] = rpmPoints;
    //     // allGeneratedData = [...allGeneratedData, ...rpmPoints];
    // }
    
    // dispatch(setAllRpmPoints(allPoints));
    // dispatch(setAllDataGenerated(allGeneratedData));
    
    // const firstGeneratedRpm = currentRpm + 1;
    // dispatch(setSelectedRpm(firstGeneratedRpm));
    // dispatch(setNextRpmPoints(allPoints[firstGeneratedRpm]));
    // setIsLoading(false);
};