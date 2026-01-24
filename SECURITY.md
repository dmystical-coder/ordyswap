# Security Policy

## ⚠️ Important Disclaimer

**This software is provided for educational purposes and has NOT been audited.**

Use at your own risk. The authors and contributors are not responsible for any loss of funds or other damages resulting from the use of this software.

## Supported Versions

| Version | Supported |
|---------|-----------|
| main    | ✅ Yes    |
| < 1.0.0 | ⚠️ Development |

## Reporting a Vulnerability

We take security vulnerabilities seriously. If you discover a security issue, please report it responsibly.

### How to Report

1. **DO NOT** create a public GitHub issue for security vulnerabilities
2. Email security concerns to: [Create a security email or use GitHub Security Advisories]
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

### What to Expect

- **Acknowledgment**: Within 48 hours
- **Initial Assessment**: Within 1 week
- **Resolution Timeline**: Depends on severity

### Severity Levels

| Level | Description | Response Time |
|-------|-------------|---------------|
| Critical | Direct fund loss possible | 24 hours |
| High | Potential fund loss with conditions | 72 hours |
| Medium | Contract state corruption | 1 week |
| Low | Minor issues, no fund risk | 2 weeks |

## Security Considerations

### Known Limitations

1. **Genesis Ordinals Only**: This contract is designed for Genesis ordinals (inscriptions that have not been transferred). Using with previously transferred ordinals may result in unexpected behavior.

2. **External Dependencies**: The contract relies on the `clarity-bitcoin` contract for Bitcoin transaction verification. Security of this implementation depends on that contract's correctness.

3. **Block Confirmation**: The contract verifies Bitcoin transactions are included in a block, but does not enforce a specific number of confirmations. Deep reorgs could potentially affect finalized offers.

4. **Cancel Grace Period**: The 50-block grace period is designed to prevent front-running, but timing attacks may still be possible in edge cases.

### Security Best Practices for Users

1. **Verify Addresses**: Always double-check Bitcoin addresses before sending ordinals
2. **Wait for Confirmations**: Wait for sufficient Bitcoin confirmations before finalizing offers
3. **Monitor Transactions**: Keep track of your active offers
4. **Start Small**: Test with small amounts before large transactions

### For Developers

1. **Input Validation**: All external inputs are validated
2. **Access Control**: Functions verify caller authorization
3. **State Machine**: Offer states are tracked to prevent double actions
4. **Reentrancy**: STX transfers are performed after state updates

## Audit Status

- [ ] Internal review completed
- [ ] External audit completed
- [ ] Bug bounty program active

## Security Checklist

### Contract Security

- [x] Error handling for all failure cases
- [x] Access control on sensitive functions
- [x] State tracking to prevent double actions
- [x] Grace period for cancellations
- [ ] Formal verification (planned)
- [ ] External security audit (planned)

### Operational Security

- [ ] Multi-sig deployment (recommended for mainnet)
- [ ] Upgrade mechanism documented
- [ ] Emergency pause functionality
- [ ] Monitoring and alerting

## Responsible Disclosure

We believe in responsible disclosure and will:

1. Work with researchers to understand and address issues
2. Credit researchers (with permission) in our changelog
3. Not take legal action against good-faith researchers
4. Provide updates on fix progress

Thank you for helping keep OrdySwap secure! 🔐
