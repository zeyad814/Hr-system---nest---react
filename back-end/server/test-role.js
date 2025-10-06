const { UserRole } = require('./dist/src/users/dto/user.dto.js');

console.log('UserRole.CLIENT:', UserRole.CLIENT);
console.log('UserRole.CLIENT type:', typeof UserRole.CLIENT);
console.log('UserRole.CLIENT length:', UserRole.CLIENT.length);
console.log('UserRole.CLIENT char codes:', UserRole.CLIENT.split('').map(c => c.charCodeAt(0)));

const tokenRole = 'CLIENT';
console.log('Token role:', tokenRole);
console.log('Token role type:', typeof tokenRole);
console.log('Token role length:', tokenRole.length);
console.log('Token role char codes:', tokenRole.split('').map(c => c.charCodeAt(0)));

console.log('Direct comparison:', tokenRole === UserRole.CLIENT);
console.log('Strict equality:', tokenRole === UserRole.CLIENT);
console.log('includes check:', [UserRole.CLIENT].includes(tokenRole));

// Test the exact comparison from the guard
const requiredRoles = [UserRole.CLIENT];
const userRole = tokenRole;
const hasRole = requiredRoles.includes(userRole);
console.log('Guard logic result:', hasRole);
