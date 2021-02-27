const cbor = require('cbor');
const base64url = require('base64url');
const crypto = require("crypto");

function parseAttestationObject(attestationObject) {
    const buffer = base64url.toBuffer(attestationObject);
    return cbor.decodeAllSync(buffer)[0];
}

function hash(data) {
    const ret = crypto
        .createHash("sha256")
        .update(data)
        .digest();
    return ret;
}

function parseGetAssertAuthData(buffer) {
    const rpIdHash = buffer.slice(0, 32);
    buffer = buffer.slice(32);

    const flagsBuf = buffer.slice(0, 1);
    buffer = buffer.slice(1);

    const flags = flagsBuf[0];

    const counterBuf = buffer.slice(0, 4);
    buffer = buffer.slice(4);

    const counter = counterBuf.readUInt32BE(0);

    return {
        rpIdHash,
        flagsBuf,
        flags,
        counter,
        counterBuf,
    };
}

function parseMakeCredAuthData(buffer) {
    const rpIdHash = buffer.slice(0, 32);
    buffer = buffer.slice(32);

    const flagsBuf = buffer.slice(0, 1);
    buffer = buffer.slice(1);

    const flags = flagsBuf[0];

    const counterBuf = buffer.slice(0, 4);
    buffer = buffer.slice(4);

    const counter = counterBuf.readUInt32BE(0);

    const aaguid = buffer.slice(0, 16);
    buffer = buffer.slice(16);

    const credIDLenBuf = buffer.slice(0, 2);
    buffer = buffer.slice(2);

    const credIDLen = credIDLenBuf.readUInt16BE(0);

    const credID = buffer.slice(0, credIDLen);
    buffer = buffer.slice(credIDLen);

    const COSEPublicKey = buffer;

    return {
        rpIdHash,
        flagsBuf,
        flags,
        counter,
        counterBuf,
        aaguid,
        credID,
        COSEPublicKey
    };
}

function COSEECDHAtoPKCS(COSEPublicKey) {
    const coseStruct = cbor.decodeAllSync(COSEPublicKey)[0];
    const tag = Buffer.from([0x04]);
    const x = coseStruct.get(-2);
    const y = coseStruct.get(-3);

    return Buffer.concat([tag, x, y]);
}

function ASN1toPEM(pkBuffer) {
    let type;
    if (pkBuffer.length === 65 && pkBuffer[0] === 0x04) {
        pkBuffer = Buffer.concat([
            new Buffer.from(
                "3059301306072a8648ce3d020106082a8648ce3d030107034200",
                "hex"
            ),
            pkBuffer
        ]);

        type = "PUBLIC KEY";
    } else {
        type = "CERTIFICATE";
    }

    const b64cert = pkBuffer.toString("base64");

    let PEMKey = "";
    for (let i = 0; i < Math.ceil(b64cert.length / 64); i++) {
        const start = 64 * i;
        PEMKey += b64cert.substr(start, 64) + "\n";
    }

    PEMKey = `-----BEGIN ${type}-----\n` + PEMKey + `-----END ${type}-----\n`;
    return PEMKey;
}

function verifySignature(signature, data, publicKey) {
    const isVerifySign = crypto
        .createVerify("SHA256")
        .update(data)
        .verify(publicKey, signature);

    return isVerifySign;
}

function verifyAssertion(params) {
    const {
        counter,
        attestationObject,
        clientDataJSON,
        authenticatorData,
        signature,
    } = params;

    const authenticatorDataBuff = base64url.toBuffer(authenticatorData);
    const authenticatorDataStruct = parseGetAssertAuthData(authenticatorDataBuff);

    if (!(authenticatorDataStruct.flags & 0x01)) {
        throw new Error("User was not presented during authentication!");
    }
    if (authenticatorDataStruct.counter <= counter) {
        throw new Error("Counter didn't increase");
    }

    const clientDataHash = hash(base64url.toBuffer(clientDataJSON));
    const signatureBase = Buffer.concat([authenticatorDataBuff, clientDataHash]);
    const makeCredResp = parseAttestationObject(attestationObject);
    const {
        COSEPublicKey
    } = parseMakeCredAuthData(makeCredResp.authData) || {};
    const input1 = COSEECDHAtoPKCS(COSEPublicKey);
    const input2 = base64url.encode(input1);
    const input3 = base64url.toBuffer(input2);
    const publicKey = ASN1toPEM(input3);
    const signatureBuff = base64url.toBuffer(signature);
    const isVerified = verifySignature(signatureBuff, signatureBase, publicKey);
    return {
        verified: isVerified,
        counter: authenticatorDataStruct.counter,
    };
}

class CryptoService {
    constructor(ctx) {
        this.blueTickMeAgent = ctx.httpAgents.blueTickMeAgent;
    }

    verifyAssertion(params) {
        return verifyAssertion(params);
    }

    singInUsingFingerprintAuth(params) {
        return this.blueTickMeAgent.post('/singInUsingFingerprintAuth', params)
            .then((response) => {
                return response.data;
            });
    }

    saveFingerprintAuthPublicKey(params) {
        return this.blueTickMeAgent.post('/saveFingerprintAuthPublicKey', params)
            .then((response) => {
                return response.data;
            });
    }
}

module.exports = CryptoService;
