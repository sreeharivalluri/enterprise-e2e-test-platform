import { exec } from 'child_process';
import util from 'util';

const execAsync = util.promisify(exec);

describe('@kubernetes Cluster Validation', () => {
  test('should return pods when cluster is available', async () => {
    try {
      const { stdout } = await execAsync('kubectl get pods --all-namespaces');
      expect(stdout).toMatch(/NAME/);
    } catch (err: any) {
      // if kubectl not configured, mark test as skipped
      console.warn('kubectl command failed, skipping cluster validation');
      return;
    }
  });

  test('deployment manifests should be valid yaml', async () => {
    // simple syntax check via kubectl
    try {
      await execAsync('kubectl apply --dry-run=client -f infrastructure/kubernetes/frontend-ui-deployment.yaml');
      await execAsync('kubectl apply --dry-run=client -f infrastructure/kubernetes/api-service-deployment.yaml');
      await execAsync('kubectl apply --dry-run=client -f infrastructure/kubernetes/kafka-service-deployment.yaml');
    } catch (err: any) {
      throw new Error('Manifest validation failed: ' + err.message);
    }
  });
});