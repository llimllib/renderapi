# RenderAPI

A TypeScript library for interacting with the Render.com API.

## Installation

```bash
npm install renderapi
```

## Features

- Fetch services, environment variables, and environment groups
- Manage registry credentials
- Monitor jobs and instance metrics
- Support for pagination and filtering
- Type-safe interfaces for Render resources

## Usage

### Authentication

All API calls require a Render API token:

```typescript
import { getServices } from 'renderapi';

const token = process.env.RENDER_API_KEY;
const services = await getServices(token);
```

### Services

```typescript
import { getServices, getService, determineService, ServiceID } from 'renderapi';

// Get all services
const allServices = await getServices(token);

// Get services with name matching a pattern
const filteredServices = await getServices(token, 'api-');

// Get a specific service by ID
const serviceId: ServiceID = 'srv-abc123456';
const service = await getService(token, serviceId);

// Get a service by ID or name
const myService = await determineService(token, 'my-service-name');
```

### Environment Variables

```typescript
import { getEnvVarsForService } from 'renderapi';

// Get environment variables for a service
const envVars = await getEnvVarsForService(token, 'srv-abc123456');
```

### Environment Groups

```typescript
import { getEnvGroups, getEnvGroup } from 'renderapi';

// Get all environment groups
const allGroups = await getEnvGroups(token);

// Get environment groups with name matching a pattern
const filteredGroups = await getEnvGroups(token, 'prod-');

// Get a specific environment group with variables
const groupDetails = await getEnvGroup(token, 'evg-abc123456');
```

### Registry Credentials

```typescript
import { getRegistryCredentials } from 'renderapi';

// Get all registry credentials
const credentials = await getRegistryCredentials(token);

// Filter registry credentials by name
const filteredCredentials = await getRegistryCredentials(token, 'docker-');
```

### Jobs

```typescript
import { listJobs } from 'renderapi';

// Get jobs for a service
const jobs = await listJobs(token, 'srv-abc123456');
```

### Metrics

```typescript
import { instanceCount } from 'renderapi';

// Get instance count metrics for services
const metrics = await instanceCount(
  token,
  ['srv-abc123456', 'srv-def789012'],
  Date.now() - 86400000, // 24 hours ago
  Date.now(),
  300 // 5-minute resolution
);
```

## Type Safety

This library provides TypeScript interfaces and type guards for Render resources:

```typescript
import { 
  isServiceID, 
  isEnvironmentID, 
  isEnvironmentGroupID,
  Service,
  EnvVar,
  EnvGroup
} from 'renderapi';

// Check if a string is a valid service ID
if (isServiceID(id)) {
  // id is now typed as ServiceID
}
```

## Error Handling

All API functions throw descriptive errors when requests fail:

```typescript
try {
  const service = await getService(token, 'srv-nonexistent');
} catch (error) {
  console.error('API request failed:', error.message);
}
```

## License

MIT
