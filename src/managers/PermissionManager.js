import { Logger } from '../utils/Logger.js';
import { PermissionFlagsBits } from 'discord.js';

export class PermissionManager {
    constructor() {
        this.logger = new Logger();
        this.permissionCache = new Map();
        this.roleHierarchy = new Map();
        this.customPermissions = new Map();
        
        this.initializeDefaultPermissions();
    }

    initializeDefaultPermissions() {
        // Define command permission requirements
        this.customPermissions.set('music', {
            play: [],
            skip: ['DJ_ROLE'],
            volume: [PermissionFlagsBits.ManageMessages],
            queue: [],
            stop: ['DJ_ROLE', PermissionFlagsBits.ManageChannels]
        });

        this.customPermissions.set('moderation', {
            ban: [PermissionFlagsBits.BanMembers],
            kick: [PermissionFlagsBits.KickMembers],
            timeout: [PermissionFlagsBits.ModerateMembers],
            warn: [PermissionFlagsBits.ManageMessages],
            purge: [PermissionFlagsBits.ManageMessages]
        });

        this.customPermissions.set('economy', {
            balance: [],
            daily: [],
            work: [],
            shop: [],
            admin: [PermissionFlagsBits.Administrator]
        });

        this.customPermissions.set('admin', {
            config: [PermissionFlagsBits.Administrator],
            setup: [PermissionFlagsBits.Administrator],
            backup: [PermissionFlagsBits.Administrator],
            eval: ['BOT_OWNER']
        });
    }

    async checkPermissions(interaction, requiredPermissions = []) {
        const member = interaction.member;
        const guild = interaction.guild;
        
        if (!member || !guild) return { allowed: false, missing: ['Server Only'] };

        // Bot owner bypass
        if (this.isBotOwner(member.user.id)) {
            return { allowed: true, missing: [] };
        }

        const missing = [];
        
        for (const permission of requiredPermissions) {
            if (typeof permission === 'string') {
                // Custom permission (role-based)
                if (permission === 'DJ_ROLE') {
                    const djRole = await this.getDJRole(guild.id);
                    if (djRole && !member.roles.cache.has(djRole)) {
                        missing.push('DJ Role');
                    }
                } else if (permission === 'BOT_OWNER') {
                    if (!this.isBotOwner(member.user.id)) {
                        missing.push('Bot Owner');
                    }
                } else {
                    // Custom role permission
                    if (!member.roles.cache.some(role => role.name === permission)) {
                        missing.push(permission);
                    }
                }
            } else {
                // Discord permission
                if (!member.permissions.has(permission)) {
                    missing.push(this.getPermissionName(permission));
                }
            }
        }

        return {
            allowed: missing.length === 0,
            missing
        };
    }

    async checkChannelPermissions(channel, member, requiredPermissions = []) {
        const missing = [];
        
        for (const permission of requiredPermissions) {
            if (!channel.permissionsFor(member).has(permission)) {
                missing.push(this.getPermissionName(permission));
            }
        }

        return {
            allowed: missing.length === 0,
            missing
        };
    }

    isBotOwner(userId) {
        const owners = process.env.OWNER_ID?.split(',') || [];
        return owners.includes(userId);
    }

    async getDJRole(guildId) {
        // Get DJ role from guild settings
        const guild = await this.client?.database?.getGuild(guildId);
        return guild?.dj_role;
    }

    getPermissionName(permission) {
        const permissionNames = {
            [PermissionFlagsBits.Administrator]: 'Administrator',
            [PermissionFlagsBits.ManageGuild]: 'Manage Server',
            [PermissionFlagsBits.ManageRoles]: 'Manage Roles',
            [PermissionFlagsBits.ManageChannels]: 'Manage Channels',
            [PermissionFlagsBits.ManageMessages]: 'Manage Messages',
            [PermissionFlagsBits.BanMembers]: 'Ban Members',
            [PermissionFlagsBits.KickMembers]: 'Kick Members',
            [PermissionFlagsBits.ModerateMembers]: 'Timeout Members',
            [PermissionFlagsBits.ViewAuditLog]: 'View Audit Log',
            [PermissionFlagsBits.Connect]: 'Connect to Voice',
            [PermissionFlagsBits.Speak]: 'Speak in Voice'
        };

        return permissionNames[permission] || 'Unknown Permission';
    }

    async updateRoleHierarchy(guild) {
        const roles = guild.roles.cache.sort((a, b) => b.position - a.position);
        this.roleHierarchy.set(guild.id, roles);
    }

    canManageRole(member, targetRole) {
        const guild = member.guild;
        const memberHighestRole = member.roles.highest;
        
        // Bot owner can manage any role
        if (this.isBotOwner(member.user.id)) return true;
        
        // Can't manage roles higher than or equal to your highest role
        if (targetRole.position >= memberHighestRole.position) return false;
        
        // Can't manage the @everyone role
        if (targetRole.id === guild.id) return false;
        
        return true;
    }

    async logPermissionCheck(interaction, result) {
        this.logger.debug('Permission check', {
            user: interaction.user.tag,
            command: interaction.commandName,
            allowed: result.allowed,
            missing: result.missing
        });
    }
}