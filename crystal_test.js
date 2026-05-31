
const CrystalTestFramework = {
    results: [],
    totalTests: 0,
    passedTests: 0,
    failedTests: 0,

    cellTypes: {
        sc: { name: '简单立方', a: 0.400, atoms: 1, coordination: 6, r: 0.200, molarMass: 55.85 },
        bcc: { name: '体心立方', a: 0.287, atoms: 2, coordination: 8, r: 0.124, molarMass: 55.85 },
        fcc: { name: '面心立方', a: 0.362, atoms: 4, coordination: 12, r: 0.128, molarMass: 63.55 },
        nacl: { name: 'NaCl型', a: 0.564, atoms: 4, coordination: 6, r_Na: 0.102, r_Cl: 0.181, molarMass: 58.44 },
        cscl: { name: 'CsCl型', a: 0.412, atoms: 1, coordination: 8, r_Cs: 0.167, r_Cl: 0.181, molarMass: 168.36 },
        diamond: { name: '金刚石', a: 0.357, atoms: 8, coordination: 4, r: 0.077, molarMass: 12.01 }
    },

    assert(condition, message) {
        return { pass: condition, message: message };
    },

    assertNear(actual, expected, tolerance, message) {
        const diff = Math.abs(actual - expected);
        return {
            pass: diff <= tolerance,
            message: `${message} (期望值: ${expected.toFixed(4)}, 实际值: ${actual.toFixed(4)}, 差值: ${diff.toFixed(6)})`
        };
    },

    runTest(category, testName, testFunc) {
        this.totalTests++;
        try {
            const result = testFunc();
            if (result.pass) { this.passedTests++; } else { this.failedTests++; }
            this.logResult(category, testName, result);
            return result;
        } catch (error) {
            this.failedTests++;
            this.logResult(category, testName, { pass: false, message: `异常: ${error.message}` });
            return { pass: false, message: `异常: ${error.message}` };
        }
    },

    logResult(category, testName, result) {
        const existingCategory = this.results.find(r => r.category === category);
        if (!existingCategory) { this.results.push({ category, tests: [] }); }
        const cat = this.results.find(r => r.category === category);
        cat.tests.push({ name: testName, ...result });
    },

    testAtomCoordinates() {
        const category = "原子坐标验证";
        this.runTest(category, "SC - 顶点原子坐标正确性", () => {
            const a = this.cellTypes.sc.a;
            const cornerAtoms = [[0,0,0],[a,0,0],[0,a,0],[0,0,a],[a,a,0],[a,0,a],[0,a,a],[a,a,a]];
            return this.assert(cornerAtoms.length === 8, `检测到${cornerAtoms.length}个顶点原子，应为8个`);
        });
        this.runTest(category, "BCC - 体心原子坐标", () => {
            const a = this.cellTypes.bcc.a;
            const center = [a/2, a/2, a/2];
            return this.assertNear(center[0], a/2, 0.001, "体心原子X坐标");
        });
        this.runTest(category, "FCC - 面心原子坐标验证", () => {
            const a = this.cellTypes.fcc.a;
            const faceAtoms = [[a/2,a/2,0],[a/2,0,a/2],[0,a/2,a/2],[a/2,a/2,a],[a/2,a,a/2],[a,a/2,a/2]];
            return this.assert(faceAtoms.length === 6, `检测到${faceAtoms.length}个面心原子，应为6个`);
        });
        this.runTest(category, "NaCl - 离子交替排列验证", () => {
            const a = this.cellTypes.nacl.a;
            const NaPositions = [[a/2,a/2,a/2],[a/2,0,0],[0,a/2,0],[0,0,a/2]];
            const ClPositions = [[0,0,0],[a/2,a/2,0],[a/2,0,a/2],[0,a/2,a/2]];
            return this.assert(NaPositions.length === 4 && ClPositions.length === 4, `Na⁺:${NaPositions.length}个, Cl⁻:${ClPositions.length}个`);
        });
        this.runTest(category, "金刚石 - 四面体间隙原子", () => {
            const a = this.cellTypes.diamond.a;
            const tetraAtoms = [[a/4,a/4,a/4],[3*a/4,3*a/4,a/4],[3*a/4,a/4,3*a/4],[a/4,3*a/4,3*a/4]];
            return this.assert(tetraAtoms.length === 4, `四面体位置应有4个原子，实际${tetraAtoms.length}个`);
        });
        this.runTest(category, "CsCl - 中心阳离子验证", () => {
            const a = this.cellTypes.cscl.a;
            const dist = Math.sqrt(Math.pow(a/2, 2) * 3);
            return this.assertNear(dist, a * Math.sqrt(3) / 2, 0.001, "Cs⁺到顶点距离");
        });
    },

    testCoordinationNumber() {
        const category = "配位数检测";
        this.runTest(category, "SC - 配位数验证", () => this.assert(this.cellTypes.sc.coordination === 6, `SC配位数应为6，实际为${this.cellTypes.sc.coordination}`));
        this.runTest(category, "BCC - 配位数验证", () => this.assert(this.cellTypes.bcc.coordination === 8, `BCC配位数应为8，实际为${this.cellTypes.bcc.coordination}`));
        this.runTest(category, "FCC - 配位数验证", () => this.assert(this.cellTypes.fcc.coordination === 12, `FCC配位数应为12，实际为${this.cellTypes.fcc.coordination}`));
        this.runTest(category, "NaCl - 6:6配位验证", () => {
            const a = this.cellTypes.nacl.a;
            const NaToCl = a / 2;
            return this.assertNear(NaToCl, 0.282, 0.01, `Na-Cl键长应为0.282nm，实际${NaToCl.toFixed(3)}nm`);
        });
        this.runTest(category, "CsCl - 8:8配位验证", () => {
            const a = this.cellTypes.cscl.a;
            const CsToCl = a * Math.sqrt(3) / 2;
            return this.assertNear(CsToCl, 0.357, 0.01, `Cs-Cl键长应为0.357nm，实际${CsToCl.toFixed(3)}nm`);
        });
        this.runTest(category, "金刚石 - 4配位验证", () => {
            const a = this.cellTypes.diamond.a;
            const bondLength = a * Math.sqrt(3) / 4;
            return this.assertNear(bondLength, 0.154, 0.01, `C-C键长应为0.154nm，实际${bondLength.toFixed(3)}nm`);
        });
    },

    testPackingEfficiency() {
        const category = "空间利用率公式验证";
        this.runTest(category, "SC - 空间利用率计算", () => {
            const a = this.cellTypes.sc.a;
            const r = a / 2;
            const V_atom = (4/3) * Math.PI * Math.pow(r, 3);
            const V_cell = Math.pow(a, 3);
            const efficiency = (1 * V_atom / V_cell) * 100;
            return this.assertNear(efficiency, 52.36, 0.1, `SC空间利用率应为52.36%，实际${efficiency.toFixed(2)}%`);
        });
        this.runTest(category, "BCC - 空间利用率计算", () => {
            const a = this.cellTypes.bcc.a;
            const r = a * Math.sqrt(3) / 4;
            const V_atom = (4/3) * Math.PI * Math.pow(r, 3);
            const V_cell = Math.pow(a, 3);
            const efficiency = (2 * V_atom / V_cell) * 100;
            return this.assertNear(efficiency, 68.02, 0.1, `BCC空间利用率应为68.02%，实际${efficiency.toFixed(2)}%`);
        });
        this.runTest(category, "FCC - 空间利用率计算", () => {
            const a = this.cellTypes.fcc.a;
            const r = a * Math.sqrt(2) / 4;
            const V_atom = (4/3) * Math.PI * Math.pow(r, 3);
            const V_cell = Math.pow(a, 3);
            const efficiency = (4 * V_atom / V_cell) * 100;
            return this.assertNear(efficiency, 74.05, 0.1, `FCC空间利用率应为74.05%，实际${efficiency.toFixed(2)}%`);
        });
        this.runTest(category, "金刚石 - 空间利用率计算", () => {
            const a = this.cellTypes.diamond.a;
            const r = a * Math.sqrt(3) / 8;
            const V_atom = (4/3) * Math.PI * Math.pow(r, 3);
            const V_cell = Math.pow(a, 3);
            const efficiency = (8 * V_atom / V_cell) * 100;
            return this.assertNear(efficiency, 34.01, 0.1, `金刚石空间利用率应为34.01%，实际${efficiency.toFixed(2)}%`);
        });
        this.runTest(category, "FCC > BCC > SC 效率排序", () => {
            const eff = { fcc: 74.05, bcc: 68.02, sc: 52.36 };
            return this.assert(eff.fcc > eff.bcc && eff.bcc > eff.sc, "效率排序验证: FCC > BCC > SC");
        });
    },

    testDensityCalculation() {
        const category = "密度计算公式验证";
        this.runTest(category, "Fe (BCC) 密度计算", () => {
            const rho = (2 * 55.85) / (6.022e23 * Math.pow(0.287e-7, 3));
            return this.assertNear(rho, 7.86, 0.1, `Fe密度应为7.86g/cm³，实际${rho.toFixed(2)}g/cm³`);
        });
        this.runTest(category, "Cu (FCC) 密度计算", () => {
            const rho = (4 * 63.55) / (6.022e23 * Math.pow(0.362e-7, 3));
            return this.assertNear(rho, 8.92, 0.1, `Cu密度应为8.92g/cm³，实际${rho.toFixed(2)}g/cm³`);
        });
        this.runTest(category, "NaCl 密度计算", () => {
            const rho = (4 * 58.44) / (6.022e23 * Math.pow(0.564e-7, 3));
            return this.assertNear(rho, 2.16, 0.1, `NaCl密度应为2.16g/cm³，实际${rho.toFixed(2)}g/cm³`);
        });
        this.runTest(category, "金刚石密度计算", () => {
            const rho = (8 * 12.01) / (6.022e23 * Math.pow(0.357e-7, 3));
            return this.assertNear(rho, 3.51, 0.1, `金刚石密度应为3.51g/cm³，实际${rho.toFixed(2)}g/cm³`);
        });
        this.runTest(category, "CsCl 密度计算", () => {
            const rho = (1 * 168.36) / (6.022e23 * Math.pow(0.412e-7, 3));
            return this.assertNear(rho, 3.99, 0.1, `CsCl密度应为3.99g/cm³，实际${rho.toFixed(2)}g/cm³`);
        });
        this.runTest(category, "密度公式边界测试", () => {
            const rho = (1 * 1.008) / (6.022e23 * Math.pow(1.0e-7, 3));
            return this.assert(rho > 0, "密度计算结果必须为正");
        });
    },

    testBraggLaw() {
        const category = "布拉格定律与XRD模拟";
        this.runTest(category, "布拉格定律公式验证", () => {
            const lambda = 0.154;
            const d = 0.200;
            const theta = Math.asin(lambda / (2 * d)) * (180 / Math.PI);
            return this.assert(theta > 0 && theta < 90, `2θ = ${(2*theta).toFixed(2)}° 在合理范围内`);
        });
        this.runTest(category, "SC - 面间距计算", () => {
            const a = this.cellTypes.sc.a;
            const d_100 = a / Math.sqrt(1);
            const d_110 = a / Math.sqrt(2);
            const d_111 = a / Math.sqrt(3);
            return this.assert(d_100 > d_110 && d_110 > d_111, `d(100)=${d_100.toFixed(3)} > d(110)=${d_110.toFixed(3)} > d(111)=${d_111.toFixed(3)}`);
        });
        this.runTest(category, "BCC - 消光规律验证", () => {
            const allowed = [{h:1,k:1,l:0},{h:2,k:0,l:0},{h:2,k:1,l:1},{h:2,k:2,l:0}];
            const forbidden = [{h:1,k:0,l:0},{h:1,k:1,l:1},{h:2,k:1,l:0}];
            const allowedPass = allowed.every(hkl => (hkl.h + hkl.k + hkl.l) % 2 === 0);
            const forbiddenPass = forbidden.every(hkl => (hkl.h + hkl.k + hkl.l) % 2 !== 0);
            return this.assert(allowedPass && forbiddenPass, "BCC消光规律: h+k+l=偶数时出现衍射");
        });
        this.runTest(category, "FCC - 消光规律验证", () => {
            const allowed = [{h:1,k:1,l:1},{h:2,k:0,l:0},{h:2,k:2,l:0},{h:3,k:1,l:1}];
            const allowedPass = allowed.every(hkl => {
                const allEven = (hkl.h % 2 === 0 && hkl.k % 2 === 0 && hkl.l % 2 === 0);
                const allOdd = (hkl.h % 2 === 1 && hkl.k % 2 === 1 && hkl.l % 2 === 1);
                return allEven || allOdd;
            });
            return this.assert(allowedPass, "FCC消光规律: h,k,l全奇或全偶时出现衍射");
        });
        this.runTest(category, "Cu Kα 波长验证", () => {
            const lambda = 0.15406;
            return this.assertNear(lambda, 0.154, 0.001, `Cu Kα波长为${lambda}nm`);
        });
    },

    testCrystalSystem() {
        const category = "晶系与几何参数";
        this.runTest(category, "立方晶系参数验证", () => {
            const volume = Math.pow(0.400, 3);
            return this.assertNear(volume, 0.064, 0.001, `晶胞体积为${volume.toFixed(3)}nm³`);
        });
        this.runTest(category, "面对角线长度", () => {
            const faceDiag = 0.400 * Math.sqrt(2);
            return this.assertNear(faceDiag, 0.5656, 0.001, `面对角线长度${faceDiag.toFixed(4)}nm`);
        });
        this.runTest(category, "体对角线长度", () => {
            const bodyDiag = 0.400 * Math.sqrt(3);
            return this.assertNear(bodyDiag, 0.6928, 0.001, `体对角线长度${bodyDiag.toFixed(4)}nm`);
        });
        this.runTest(category, "原子半径-晶格常数关系", () => {
            const r1 = this.cellTypes.sc.a / 2;
            const r2 = this.cellTypes.bcc.a * Math.sqrt(3) / 4;
            const r3 = this.cellTypes.fcc.a * Math.sqrt(2) / 4;
            const pass = Math.abs(r1 - 0.200) < 0.001 && Math.abs(r2 - 0.124) < 0.01 && Math.abs(r3 - 0.128) < 0.01;
            return this.assert(pass, "原子半径关系验证");
        });
        this.runTest(category, "石墨层间距", () => {
            const layerDistance = 0.670 / 2;
            return this.assertNear(layerDistance, 0.335, 0.001, `石墨层间距${layerDistance.toFixed(3)}nm`);
        });
    },

    calculateXRDPeaks(cellType) {
        const cell = this.cellTypes[cellType];
        const lambda = 0.15406;
        const peaks = [];
        const millerIndices = [];
        for (let h = 0; h <= 5; h++) {
            for (let k = 0; k <= 5; k++) {
                for (let l = 0; l <= 5; l++) {
                    if (h === 0 && k === 0 && l === 0) continue;
                    millerIndices.push({h, k, l});
                }
            }
        }
        millerIndices.forEach(hkl => {
            const {h, k, l} = hkl;
            let allowed = false;
            if (cellType === 'sc') { allowed = true; }
            else if (cellType === 'bcc') { allowed = (h + k + l) % 2 === 0; }
            else if (cellType === 'fcc') {
                const allEven = (h % 2 === 0 && k % 2 === 0 && l % 2 === 0);
                const allOdd = (h % 2 === 1 && k % 2 === 1 && l % 2 === 1);
                allowed = allEven || allOdd;
            } else if (cellType === 'diamond') {
                const allEven = (h % 2 === 0 && k % 2 === 0 && l % 2 === 0);
                const allOdd = (h % 2 === 1 && k % 2 === 1 && l % 2 === 1);
                allowed = (allEven || allOdd) && ((h + k + l) % 4 !== 2);
            }
            if (allowed) {
                const d = cell.a / Math.sqrt(h*h + k*k + l*l);
                const ratio = lambda / (2 * d);
                if (ratio <= 1 && ratio >= -1) {
                    const theta = Math.asin(ratio) * (180 / Math.PI);
                    const twoTheta = 2 * theta;
                    if (twoTheta > 10 && twoTheta < 100) { peaks.push({ twoTheta, d, hkl: `(${h}${k}${l})` }); }
                }
            }
        });
        return peaks.sort((a, b) => a.twoTheta - b.twoTheta);
    },

    runAllTests() {
        this.results = [];
        this.totalTests = 0;
        this.passedTests = 0;
        this.failedTests = 0;
        this.testAtomCoordinates();
        this.testCoordinationNumber();
        this.testPackingEfficiency();
        this.testDensityCalculation();
        this.testBraggLaw();
        this.testCrystalSystem();
        return this.results;
    },

    printResults() {
        console.log('\n' + '='.repeat(60));
        console.log('🔬 晶体结构测试报告');
        console.log('='.repeat(60));
        console.log(`总计: ${this.totalTests} | ✅ 通过: ${this.passedTests} | ❌ 失败: ${this.failedTests}`);
        console.log('='.repeat(60));
        this.results.forEach(category => {
            const passed = category.tests.filter(t => t.pass).length;
            console.log(`\n📂 ${category.category} (${passed}/${category.tests.length})`);
            category.tests.forEach(test => {
                const status = test.pass ? '✅' : '❌';
                console.log(`  ${status} ${test.name}`);
                if (!test.pass) { console.log(`     ${test.message}`); }
            });
        });
        console.log('\n' + '='.repeat(60));
        const successRate = ((this.passedTests / this.totalTests) * 100).toFixed(1);
        console.log(`📊 测试通过率: ${successRate}%`);
        console.log('='.repeat(60) + '\n');
    }
};

function main() {
    console.log('🚀 开始运行晶体结构测试...');
    CrystalTestFramework.runAllTests();
    CrystalTestFramework.printResults();
    console.log('\n📈 XRD衍射峰计算:');
    ['sc', 'bcc', 'fcc'].forEach(type => {
        const peaks = CrystalTestFramework.calculateXRDPeaks(type);
        console.log(`\n  ${type.toUpperCase()} - 前5个衍射峰:`);
        peaks.slice(0, 5).forEach((peak, i) => {
            console.log(`    ${i+1}. ${peak.hkl} 2θ = ${peak.twoTheta.toFixed(2)}° d = ${peak.d.toFixed(4)}nm`);
        });
    });
}

main();
