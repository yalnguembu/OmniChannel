import { useState, useMemo } from "react";
import { Toggle } from "@/components/ui/Toggle";
import { ACTION } from "@/security/enums";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface PermissionsMapperProps {
  selectedPermissions: string[];
  onChange: (permissions: string[]) => void;
}

// Group permissions by resource type
const getPermissionGroups = (): Record<string, string[]> => {
  const groups: Record<string, string[]> = {};

  Object.values(ACTION).forEach((permission) => {
    const parts = permission.split("_");
    if (parts.length >= 2) {
      const resource = parts.slice(0, -1).join("_");
      if (!groups[resource]) {
        groups[resource] = [];
      }
      groups[resource].push(permission);
    }
  });

  // Sort groups and permissions within groups
  const sortedGroups: Record<string, string[]> = {};
  Object.keys(groups)
    .sort()
    .forEach((key) => {
      sortedGroups[key] = groups[key].sort();
    });

  return sortedGroups;
};

// Format resource name for display
const formatResourceName = (resource: string): string => {
  return resource
    .split("_")
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(" ");
};

// Format action name for display
const formatActionName = (action: string): string => {
  const parts = action.split("_");
  return parts[parts.length - 1];
};

export function PermissionsMapper({
  selectedPermissions,
  onChange,
}: PermissionsMapperProps) {
  const permissionGroups = useMemo(() => getPermissionGroups(), []);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    new Set(Object.keys(permissionGroups).slice(0, 3)),
  );

  const toggleGroup = (group: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(group)) {
      newExpanded.delete(group);
    } else {
      newExpanded.add(group);
    }
    setExpandedGroups(newExpanded);
  };

  const togglePermission = (permission: string) => {
    const newPermissions = selectedPermissions.includes(permission)
      ? selectedPermissions.filter((p) => p !== permission)
      : [...selectedPermissions, permission];
    onChange(newPermissions);
  };

  const getGroupStatus = (groupPermissions: string[]) => {
    const selected = groupPermissions.filter((p) =>
      selectedPermissions.includes(p),
    );
    return {
      all: selected.length === groupPermissions.length,
      some: selected.length > 0 && selected.length < groupPermissions.length,
      none: selected.length === 0,
    };
  };

  const toggleGroupAll = (group: string, permissions: string[]) => {
    const status = getGroupStatus(permissions);
    if (status.all || status.some) {
      // Remove all from group
      const newPermissions = selectedPermissions.filter(
        (p) => !permissions.includes(p),
      );
      onChange(newPermissions);
    } else {
      // Add all to group
      const newPermissions = Array.from(
        new Set([...selectedPermissions, ...permissions]),
      );
      onChange(newPermissions);
    }
  };

  const toggleAllPermissions = () => {
    const allPermissions = Object.values(permissionGroups).flat();
    if (selectedPermissions.length === allPermissions.length) {
      // Deselect all
      onChange([]);
    } else {
      // Select all
      onChange(allPermissions);
    }
  };

  const allPermissions = Object.values(permissionGroups).flat();
  const allSelected = selectedPermissions.length === allPermissions.length;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between p-3 bg-[#F7F8F9] border border-[#E5E7EB] rounded-md">
        <div className="flex items-center gap-2">
          <span className="text-[12.5px] font-medium text-[#0D2137]">
            {selectedPermissions.length}/{allPermissions.length} permissions
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleAllPermissions}
            className="text-[12px] px-3 py-1.5 text-[#2E8FAD] hover:bg-[#E8F4F8] rounded transition-colors font-medium"
          >
            {allSelected ? "Désélectionner tout" : "Sélectionner tout"}
          </button>
          <Toggle checked={allSelected} onChange={toggleAllPermissions} />
        </div>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(permissionGroups).map(([group, permissions]) => {
          const status = getGroupStatus(permissions);
          const isExpanded = expandedGroups.has(group);

          return (
            <div
              key={group}
              className="border border-[#E5E7EB] rounded-md overflow-hidden"
            >
              <button
                type="button"
                onClick={() => toggleGroup(group)}
                className="w-full px-3 py-2.5 flex items-center justify-between bg-[#F7F8F9] hover:bg-[#EEF2F5] transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-semibold text-[#0D2137]">
                    {formatResourceName(group)}
                  </span>
                  <span className="text-[11px] text-[#8BAFC0] bg-[#E5E7EB] px-2 py-0.5 rounded">
                    {
                      permissions.filter((p) => selectedPermissions.includes(p))
                        .length
                    }
                    /{permissions.length}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div onClick={(e) => e.stopPropagation()}>
                    <Toggle
                      checked={!status.none}
                      onChange={() => toggleGroupAll(group, permissions)}
                    />
                  </div>
                  <ChevronDown
                    size={16}
                    className={cn(
                      "transition-transform text-[#8BAFC0]",
                      isExpanded ? "rotate-180" : "",
                    )}
                  />
                </div>
              </button>

              {isExpanded && (
                <div className="px-3 py-2 space-y-2 bg-white">
                  {permissions.map((permission) => {
                    const isSelected = selectedPermissions.includes(permission);
                    return (
                      <label
                        key={permission}
                        className="flex items-center gap-2 p-2 rounded hover:bg-[#F7F8F9] cursor-pointer transition-colors"
                      >
                        <Toggle
                          checked={isSelected}
                          onChange={() => togglePermission(permission)}
                        />
                        <span className="text-[12px] font-mono text-[#4A7A94]">
                          {formatActionName(permission)}
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
      {/* Hidden input for form compatibility */}
      <input type="hidden" value={selectedPermissions.join(",")} readOnly />
    </div>
  );
}
